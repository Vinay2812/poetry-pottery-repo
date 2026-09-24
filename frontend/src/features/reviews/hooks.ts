"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
  CreateEventReviewDocument,
  CreateProductReviewDocument,
  CreateReviewImageUploadDocument,
  DeleteReviewDocument,
  EventReviewEligibilityDocument,
  EventReviewsDocument,
  ProductReviewEligibilityDocument,
  ProductReviewsDocument,
  UpdateReviewDocument,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type { ReviewFormValues } from "@/lib/validations/review";

import {
  checkReviewDimensions,
  checkReviewFile,
  type ReviewAction,
  type ReviewEligibilityData,
  type ReviewSubject,
  REVIEWS_PAGE_SIZE,
  toDraftReview,
  toReviewInput,
  toSubjectHref,
  toUploadSubject,
} from "./types";

async function readDimensions(file: File): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const problem = checkReviewDimensions(bitmap.width, bitmap.height);
    bitmap.close();
    return problem;
  } catch {
    return "That file could not be read as an image";
  }
}

// Photos are checked here, signed for, then pushed straight to storage.
function useReviewPhotoUpload(subject: ReviewSubject) {
  const [createUpload] = useMutation(CreateReviewImageUploadDocument);
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      const fileProblem = checkReviewFile(file.type, file.size);
      if (fileProblem) {
        toast.error(fileProblem);
        return null;
      }
      setIsUploading(true);
      try {
        const sizeProblem = await readDimensions(file);
        if (sizeProblem) {
          toast.error(sizeProblem);
          return null;
        }
        const subjectIds = toUploadSubject(subject);
        const { data } = await createUpload({
          variables: {
            input: {
              product_id: subjectIds.product_id,
              event_id: subjectIds.event_id,
              filename: file.name,
              content_type: file.type,
              size: file.size,
            },
          },
        });
        const target = data?.createReviewImageUpload;
        if (!target) return null;
        // The bucket answers for itself, so its refusal is about the photo, not the connection.
        const response = await fetch(target.upload_url, {
          method: "PUT",
          body: file,
          headers: { "content-type": file.type },
        }).catch(() => null);
        if (!response?.ok) {
          toast.error("That photo did not upload");
          return null;
        }
        return target.public_url;
      } catch (error) {
        toast.error(describeError(error, "That photo did not upload"));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [createUpload, subject],
  );

  return { upload, isUploading };
}

// One page of reviews at a time, with the rest appended onto the same query.
export function useReviewList(subject: ReviewSubject) {
  const isProduct = subject.kind === "product";
  const productQuery = useQuery(ProductReviewsDocument, {
    variables: { product_id: subject.id, page: 1, limit: REVIEWS_PAGE_SIZE },
    skip: !isProduct,
    notifyOnNetworkStatusChange: true,
  });
  const eventQuery = useQuery(EventReviewsDocument, {
    variables: { event_id: subject.id, page: 1, limit: REVIEWS_PAGE_SIZE },
    skip: isProduct,
    notifyOnNetworkStatusChange: true,
  });

  const result = isProduct
    ? (productQuery.data ?? productQuery.previousData)?.productReviews
    : (eventQuery.data ?? eventQuery.previousData)?.eventReviews;
  const loading = isProduct ? productQuery.loading : eventQuery.loading;
  const pageInfo = result?.page_info;

  const loadMore = useCallback(() => {
    if (!pageInfo?.has_more || loading) return;
    const next = { page: pageInfo.page + 1, limit: pageInfo.limit };
    if (isProduct) {
      void productQuery.fetchMore({
        variables: next,
        updateQuery: (previous, { fetchMoreResult }) => ({
          productReviews: {
            ...fetchMoreResult.productReviews,
            items: [
              ...previous.productReviews.items,
              ...fetchMoreResult.productReviews.items,
            ],
          },
        }),
      });
      return;
    }
    void eventQuery.fetchMore({
      variables: next,
      updateQuery: (previous, { fetchMoreResult }) => ({
        eventReviews: {
          ...fetchMoreResult.eventReviews,
          items: [
            ...previous.eventReviews.items,
            ...fetchMoreResult.eventReviews.items,
          ],
        },
      }),
    });
  }, [eventQuery, isProduct, loading, pageInfo, productQuery]);

  // After a post or a delete the whole loaded window is read again, so the list keeps every
  // page the reader asked for instead of snapping back to the first five.
  const loadedCount = result?.items.length ?? 0;
  const refetchLoaded = useCallback(async () => {
    const window = {
      page: 1,
      limit: Math.max(REVIEWS_PAGE_SIZE, loadedCount),
    };
    if (isProduct) {
      await productQuery.fetchMore({
        variables: window,
        updateQuery: (_previous, { fetchMoreResult }) => fetchMoreResult,
      });
      return;
    }
    await eventQuery.fetchMore({
      variables: window,
      updateQuery: (_previous, { fetchMoreResult }) => fetchMoreResult,
    });
  }, [eventQuery, isProduct, loadedCount, productQuery]);

  return {
    result: result ?? null,
    isLoading: loading && !result,
    isLoadingMore: loading && Boolean(result),
    loadMore,
    refetchLoaded,
  };
}

// Eligibility is personal, so it is only asked for once a session exists.
function useReviewEligibility(subject: ReviewSubject) {
  const { isSignedIn } = useAuth();
  const isProduct = subject.kind === "product";
  const productQuery = useQuery(ProductReviewEligibilityDocument, {
    variables: { slug: subject.slug },
    skip: !isSignedIn || !isProduct,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const eventQuery = useQuery(EventReviewEligibilityDocument, {
    variables: { slug: subject.slug },
    skip: !isSignedIn || isProduct,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const eligibility: ReviewEligibilityData | null = isProduct
    ? (productQuery.data?.product.review_eligibility ?? null)
    : (eventQuery.data?.event.review_eligibility ?? null);

  return {
    canReview: Boolean(isSignedIn && eligibility?.can_review),
    myReview: eligibility?.my_review ?? null,
    isSignedIn: Boolean(isSignedIn),
  };
}

// A reply only carries the review itself, never the counts, so the refetched
// answers are the new baseline.
function toEligibilityName(subject: ReviewSubject): string {
  return subject.kind === "product"
    ? "ProductReviewEligibility"
    : "EventReviewEligibility";
}

// What the panel lends the composer: its optimistic dispatcher and a way to re-read the window
// already on screen. An order line has neither.
export interface ReviewListSync {
  onOptimistic: (action: ReviewAction) => void;
  refetchLoaded: () => Promise<void>;
}

function useReviewMutations(
  subject: ReviewSubject,
  list: ReviewListSync | undefined,
) {
  const client = useApolloClient();
  const [createProduct] = useMutation(CreateProductReviewDocument);
  const [createEvent] = useMutation(CreateEventReviewDocument);
  const [updateMutation] = useMutation(UpdateReviewDocument);
  const [removeMutation] = useMutation(DeleteReviewDocument);

  const save = useCallback(
    async (values: ReviewFormValues, id: number | null): Promise<void> => {
      const input = toReviewInput(values);
      const settle = {
        refetchQueries: [toEligibilityName(subject)],
        awaitRefetchQueries: true,
      };
      if (id !== null) {
        await updateMutation({ variables: { id, input }, ...settle });
      } else if (subject.kind === "product") {
        await createProduct({
          variables: { product_id: subject.id, input },
          ...settle,
        });
      } else {
        await createEvent({
          variables: { event_id: subject.id, input },
          ...settle,
        });
      }
      await list?.refetchLoaded();
    },
    [createEvent, createProduct, list, subject, updateMutation],
  );

  const remove = useCallback(
    (id: number) => removeMutation({ variables: { id } }),
    [removeMutation],
  );

  const refresh = useCallback(
    () =>
      Promise.all([
        client.refetchQueries({ include: [toEligibilityName(subject)] }),
        list?.refetchLoaded(),
      ]),
    [client, list, subject],
  );

  return { save, remove, refresh };
}

// Everything the write-a-review dialog needs, wherever it is opened from. The panel
// lends its list; an order line has none on screen to patch.
export function useReviewComposer(
  subject: ReviewSubject,
  subjectName: string,
  list?: ReviewListSync,
) {
  const { canReview, myReview, isSignedIn } = useReviewEligibility(subject);
  const { save, remove, refresh } = useReviewMutations(subject, list);
  const { upload, isUploading } = useReviewPhotoUpload(subject);
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const open = useCallback(() => {
    setError(null);
    setIsOpen(true);
  }, []);

  // The review shows at once behind the dialog; a refusal leaves the dialog standing with the
  // typed words and the uploaded photos still in it, and says why inline rather than in a toast.
  const submit = useCallback(
    (values: ReviewFormValues) => {
      const previous = myReview;
      setError(null);
      startTransition(async () => {
        const draft = toDraftReview(values, previous, {
          author: {
            name: user?.fullName ?? "You",
            image: user?.imageUrl ?? null,
          },
          subjectName,
          subjectHref: toSubjectHref(subject),
          createdAt: new Date().toISOString(),
        });
        list?.onOptimistic(
          previous
            ? { kind: "edit", review: draft }
            : { kind: "post", review: draft },
        );
        try {
          await save(values, previous?.id ?? null);
          setIsOpen(false);
          toast.success(previous ? "Review updated" : "Review posted");
        } catch (caught) {
          setError(describeError(caught, "The review could not be saved"));
        }
      });
    },
    [list, myReview, save, subject, subjectName, user],
  );

  const { execute: removeReview, isPending: isRemoving } = useOptimisticAction({
    patch: (id: number) => list?.onOptimistic({ kind: "remove", id }),
    run: remove,
    refresh,
    messages: {
      success: "Review removed",
      failure: "The review could not be removed",
    },
  });

  const removeMine = useCallback(() => {
    if (!myReview) return;
    setIsOpen(false);
    removeReview(myReview.id);
  }, [myReview, removeReview]);

  return {
    canReview,
    error,
    isOpen,
    isSaving: isSubmitting || isRemoving,
    isSignedIn,
    isUploading,
    myReview,
    open,
    removeMine,
    setIsOpen,
    submit,
    upload,
  };
}
