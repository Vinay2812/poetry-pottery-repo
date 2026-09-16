"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  useCreateEventReviewMutation,
  useCreateProductReviewMutation,
  useCreateReviewImageUploadMutation,
  useDeleteReviewMutation,
  useEventReviewEligibilityQuery,
  useEventReviewsQuery,
  useProductReviewEligibilityQuery,
  useProductReviewsQuery,
  useUpdateReviewMutation,
} from "@/graphql/generated/graphql";

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

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

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
  const [createUpload] = useCreateReviewImageUploadMutation();
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
        const response = await fetch(target.upload_url, {
          method: "PUT",
          body: file,
          headers: { "content-type": file.type },
        });
        if (!response.ok) {
          toast.error("That photo did not upload");
          return null;
        }
        return target.public_url;
      } catch (error) {
        toast.error(toErrorMessage(error));
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
  const productQuery = useProductReviewsQuery({
    variables: { product_id: subject.id, page: 1, limit: REVIEWS_PAGE_SIZE },
    skip: !isProduct,
    notifyOnNetworkStatusChange: true,
  });
  const eventQuery = useEventReviewsQuery({
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
    const nextPage = pageInfo.page + 1;
    if (isProduct) {
      void productQuery.fetchMore({
        variables: { page: nextPage },
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
      variables: { page: nextPage },
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

  return {
    result: result ?? null,
    isLoading: loading && !result,
    isLoadingMore: loading && Boolean(result),
    loadMore,
  };
}

// Eligibility is personal, so it is only asked for once a session exists.
function useReviewEligibility(subject: ReviewSubject) {
  const { isSignedIn } = useAuth();
  const isProduct = subject.kind === "product";
  const productQuery = useProductReviewEligibilityQuery({
    variables: { slug: subject.slug },
    skip: !isSignedIn || !isProduct,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const eventQuery = useEventReviewEligibilityQuery({
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
// answers are the new baseline. Only the panel has the list mounted.
function toRefetchNames(subject: ReviewSubject, hasList: boolean): string[] {
  const isProduct = subject.kind === "product";
  const eligibility = isProduct
    ? "ProductReviewEligibility"
    : "EventReviewEligibility";
  if (!hasList) return [eligibility];
  return [isProduct ? "ProductReviews" : "EventReviews", eligibility];
}

function useReviewMutations(subject: ReviewSubject, hasList: boolean) {
  const [createProduct] = useCreateProductReviewMutation();
  const [createEvent] = useCreateEventReviewMutation();
  const [updateMutation] = useUpdateReviewMutation();
  const [removeMutation] = useDeleteReviewMutation();

  const save = useCallback(
    async (values: ReviewFormValues, id: number | null): Promise<void> => {
      const input = toReviewInput(values);
      const settle = {
        refetchQueries: toRefetchNames(subject, hasList),
        awaitRefetchQueries: true,
      };
      if (id !== null) {
        await updateMutation({ variables: { id, input }, ...settle });
        return;
      }
      if (subject.kind === "product") {
        await createProduct({
          variables: { product_id: subject.id, input },
          ...settle,
        });
        return;
      }
      await createEvent({
        variables: { event_id: subject.id, input },
        ...settle,
      });
    },
    [createEvent, createProduct, hasList, subject, updateMutation],
  );

  const remove = useCallback(
    async (id: number): Promise<void> => {
      await removeMutation({
        variables: { id },
        refetchQueries: toRefetchNames(subject, hasList),
        awaitRefetchQueries: true,
      });
    },
    [hasList, removeMutation, subject],
  );

  return { save, remove };
}

// Everything the write-a-review dialog needs, wherever it is opened from. The panel
// hands in its optimistic dispatcher; an order line has no list on screen to patch.
export function useReviewComposer(
  subject: ReviewSubject,
  subjectName: string,
  onOptimistic?: (action: ReviewAction) => void,
) {
  const hasList = onOptimistic !== undefined;
  const { canReview, myReview, isSignedIn } = useReviewEligibility(subject);
  const { save, remove } = useReviewMutations(subject, hasList);
  const { upload, isUploading } = useReviewPhotoUpload(subject);
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  const open = useCallback(() => {
    setError(null);
    setIsOpen(true);
  }, []);

  // The review shows at once behind the dialog; a refusal leaves the dialog standing with the
  // typed words and the uploaded photos still in it, and says why.
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
        onOptimistic?.(
          previous
            ? { kind: "edit", review: draft }
            : { kind: "post", review: draft },
        );
        try {
          await save(values, previous?.id ?? null);
          setIsOpen(false);
          toast.success(previous ? "Review updated" : "Review posted");
        } catch (caught) {
          setError(toErrorMessage(caught));
        }
      });
    },
    [myReview, onOptimistic, save, subject, subjectName, user],
  );

  const removeMine = useCallback(() => {
    const previous = myReview;
    if (!previous) return;
    setIsOpen(false);
    startTransition(async () => {
      onOptimistic?.({ kind: "remove", id: previous.id });
      try {
        await remove(previous.id);
        toast.success("Review removed");
      } catch (caught) {
        toast.error(toErrorMessage(caught));
      }
    });
  }, [myReview, onOptimistic, remove]);

  return {
    canReview,
    error,
    isOpen,
    isSaving,
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
