"use client";

import { useCallback, useMemo, useState } from "react";

import { ReviewDialog } from "@/features/reviews/components/ReviewDialog";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { ReviewItem } from "@/features/reviews/components/ReviewItem";
import { ReviewPhotoDialog } from "@/features/reviews/components/ReviewPhotoDialog";
import { ReviewsSection } from "@/features/reviews/components/ReviewsSection";
import {
  type ReviewSubjectKind,
  useReviewComposer,
  useReviewList,
} from "@/features/reviews/hooks";
import {
  EVENT_REVIEW_NOTE,
  PRODUCT_REVIEW_NOTE,
  toFormValues,
  toReviewDate,
} from "@/features/reviews/types";

export interface ReviewsPanelContainerProps {
  kind: ReviewSubjectKind;
  subjectId: number;
  slug: string;
  subjectName: string;
}

export function ReviewsPanelContainer({
  kind,
  subjectId,
  slug,
  subjectName,
}: ReviewsPanelContainerProps) {
  const subject = useMemo(
    () => ({ kind, id: subjectId, slug }),
    [kind, slug, subjectId],
  );
  const { items, summary, hasMore, isLoading, isLoadingMore, loadMore } =
    useReviewList(subject);
  const {
    canReview,
    isOpen,
    isSaving,
    isUploading,
    myReview,
    open,
    removeMine,
    setIsOpen,
    submit,
    upload,
  } = useReviewComposer(subject);
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);

  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);
  const handleClosePhoto = useCallback(() => setOpenPhoto(null), []);

  const hasMine = myReview !== null;
  const ctaLabel = !hasMine && canReview ? "Write a review" : null;
  const quietLine =
    !canReview && !hasMine
      ? kind === "product"
        ? PRODUCT_REVIEW_NOTE
        : EVENT_REVIEW_NOTE
      : null;
  const defaults = toFormValues(myReview);

  return (
    <>
      <ReviewsSection
        title="Reviews"
        average={summary?.average ?? 0}
        count={summary?.count ?? 0}
        distribution={summary?.distribution ?? [0, 0, 0, 0, 0]}
        quietLine={quietLine}
        ctaLabel={ctaLabel}
        isLoading={isLoading}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onWriteReview={open}
        onLoadMore={loadMore}
      >
        {items.map((review) => (
          <ReviewItem
            key={review.id}
            authorName={review.author.name}
            dateLabel={toReviewDate(review.created_at)}
            rating={review.rating}
            body={review.body}
            photoUrls={review.image_urls}
            isMine={review.is_mine}
            onEdit={review.is_mine ? open : undefined}
            onDelete={review.is_mine ? () => void removeMine() : undefined}
            onOpenPhoto={setOpenPhoto}
          />
        ))}
      </ReviewsSection>

      <ReviewDialog
        isOpen={isOpen}
        title={hasMine ? "Edit your review" : "Write a review"}
        description={subjectName}
        onOpenChange={setIsOpen}
      >
        <ReviewForm
          defaultRating={defaults.rating}
          defaultBody={defaults.body}
          defaultPhotoUrls={defaults.image_urls}
          isSubmitting={isSaving}
          isUploading={isUploading}
          submitLabel={hasMine ? "Save changes" : "Post review"}
          onSubmit={(values) => void submit(values)}
          onUploadPhoto={upload}
          onCancel={handleClose}
        />
      </ReviewDialog>

      <ReviewPhotoDialog
        isOpen={openPhoto !== null}
        url={openPhoto}
        alt={`Photo from a review of ${subjectName}`}
        onOpenChange={handleClosePhoto}
      />
    </>
  );
}
