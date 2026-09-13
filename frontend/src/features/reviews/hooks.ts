"use client";

import type { ApolloCache } from "@apollo/client";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  EventReviewEligibilityDocument,
  type EventReviewEligibilityQuery,
  type EventReviewEligibilityQueryVariables,
  EventReviewsDocument,
  type EventReviewsQuery,
  type EventReviewsQueryVariables,
  ProductReviewEligibilityDocument,
  type ProductReviewEligibilityQuery,
  type ProductReviewEligibilityQueryVariables,
  ProductReviewsDocument,
  type ProductReviewsQuery,
  type ProductReviewsQueryVariables,
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
  type ReviewData,
  type ReviewEligibilityData,
  type ReviewsResultData,
  REVIEWS_PAGE_SIZE,
  toReviewInput,
  withReviewAdded,
  withReviewRemoved,
  withReviewUpdated,
} from "./types";

export type ReviewSubjectKind = "product" | "event";

export interface ReviewSubject {
  kind: ReviewSubjectKind;
  id: number;
  slug: string;
}

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
function useReviewPhotoUpload() {
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
        const { data } = await createUpload({
          variables: {
            input: {
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
    [createUpload],
  );

  return { upload, isUploading };
}

function listVariables(subject: ReviewSubject) {
  return subject.kind === "product"
    ? { product_id: subject.id, page: 1, limit: REVIEWS_PAGE_SIZE }
    : { event_id: subject.id, page: 1, limit: REVIEWS_PAGE_SIZE };
}

function updateList(
  cache: ApolloCache,
  subject: ReviewSubject,
  change: (result: ReviewsResultData) => ReviewsResultData,
): void {
  if (subject.kind === "product") {
    cache.updateQuery<ProductReviewsQuery, ProductReviewsQueryVariables>(
      {
        query: ProductReviewsDocument,
        variables: listVariables(subject) as ProductReviewsQueryVariables,
      },
      (previous) =>
        previous
          ? { productReviews: change(previous.productReviews) }
          : previous,
    );
    return;
  }
  cache.updateQuery<EventReviewsQuery, EventReviewsQueryVariables>(
    {
      query: EventReviewsDocument,
      variables: listVariables(subject) as EventReviewsQueryVariables,
    },
    (previous) =>
      previous ? { eventReviews: change(previous.eventReviews) } : previous,
  );
}

function updateEligibility(
  cache: ApolloCache,
  subject: ReviewSubject,
  review: ReviewData | null,
): void {
  if (subject.kind === "product") {
    cache.updateQuery<
      ProductReviewEligibilityQuery,
      ProductReviewEligibilityQueryVariables
    >(
      {
        query: ProductReviewEligibilityDocument,
        variables: { slug: subject.slug },
      },
      (previous) =>
        previous
          ? {
              product: {
                ...previous.product,
                review_eligibility: {
                  ...previous.product.review_eligibility,
                  can_review: true,
                  reason: null,
                  my_review: review,
                },
              },
            }
          : previous,
    );
    return;
  }
  cache.updateQuery<
    EventReviewEligibilityQuery,
    EventReviewEligibilityQueryVariables
  >(
    {
      query: EventReviewEligibilityDocument,
      variables: { slug: subject.slug },
    },
    (previous) =>
      previous
        ? {
            event: {
              ...previous.event,
              review_eligibility: {
                ...previous.event.review_eligibility,
                can_review: true,
                reason: null,
                my_review: review,
              },
            },
          }
        : previous,
  );
}

// One page of reviews at a time, with the rest appended onto the same cache entry.
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
    items: result?.items ?? [],
    summary: result?.summary ?? null,
    hasMore: pageInfo?.has_more ?? false,
    total: pageInfo?.total ?? 0,
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

function useReviewMutations(subject: ReviewSubject) {
  const [createProduct, { loading: isCreatingProduct }] =
    useCreateProductReviewMutation();
  const [createEvent, { loading: isCreatingEvent }] =
    useCreateEventReviewMutation();
  const [updateMutation, { loading: isUpdating }] = useUpdateReviewMutation();
  const [removeMutation, { loading: isRemoving }] = useDeleteReviewMutation();

  const create = useCallback(
    async (values: ReviewFormValues): Promise<ReviewData | null> => {
      const input = toReviewInput(values);
      const onWrite = (cache: ApolloCache, review: ReviewData | null) => {
        if (!review) return;
        updateList(cache, subject, (result) => withReviewAdded(result, review));
        updateEligibility(cache, subject, review);
      };
      try {
        if (subject.kind === "product") {
          const { data } = await createProduct({
            variables: { product_id: subject.id, input },
            update: (cache, result) =>
              onWrite(cache, result.data?.createProductReview ?? null),
          });
          toast.success("Review posted");
          return data?.createProductReview ?? null;
        }
        const { data } = await createEvent({
          variables: { event_id: subject.id, input },
          update: (cache, result) =>
            onWrite(cache, result.data?.createEventReview ?? null),
        });
        toast.success("Review posted");
        return data?.createEventReview ?? null;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return null;
      }
    },
    [createEvent, createProduct, subject],
  );

  const update = useCallback(
    async (
      id: number,
      values: ReviewFormValues,
    ): Promise<ReviewData | null> => {
      try {
        const { data } = await updateMutation({
          variables: { id, input: toReviewInput(values) },
          update: (cache, result) => {
            const review = result.data?.updateReview;
            if (!review) return;
            updateList(cache, subject, (current) =>
              withReviewUpdated(current, review),
            );
            updateEligibility(cache, subject, review);
          },
        });
        toast.success("Review updated");
        return data?.updateReview ?? null;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return null;
      }
    },
    [subject, updateMutation],
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await removeMutation({
          variables: { id },
          update: (cache, result) => {
            if (!result.data?.deleteReview) return;
            updateList(cache, subject, (current) =>
              withReviewRemoved(current, id),
            );
            updateEligibility(cache, subject, null);
          },
        });
        toast.success("Review removed");
        return true;
      } catch (error) {
        toast.error(toErrorMessage(error));
        return false;
      }
    },
    [removeMutation, subject],
  );

  return {
    create,
    update,
    remove,
    isSaving: isCreatingProduct || isCreatingEvent || isUpdating || isRemoving,
  };
}

// Everything the write-a-review dialog needs, wherever it is opened from.
export function useReviewComposer(subject: ReviewSubject) {
  const { canReview, myReview, isSignedIn } = useReviewEligibility(subject);
  const { create, update, remove, isSaving } = useReviewMutations(subject);
  const { upload, isUploading } = useReviewPhotoUpload();
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);

  const submit = useCallback(
    async (values: ReviewFormValues): Promise<void> => {
      const saved = myReview
        ? await update(myReview.id, values)
        : await create(values);
      if (saved) setIsOpen(false);
    },
    [create, myReview, update],
  );

  const removeMine = useCallback(async (): Promise<void> => {
    if (!myReview) return;
    const done = await remove(myReview.id);
    if (done) setIsOpen(false);
  }, [myReview, remove]);

  return {
    canReview,
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
