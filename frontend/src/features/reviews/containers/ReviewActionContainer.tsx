"use client";

import { useCallback, useMemo } from "react";

import { ReviewDialog } from "@/features/reviews/components/ReviewDialog";
import { ReviewForm } from "@/features/reviews/components/ReviewForm";
import { ReviewLink } from "@/features/reviews/components/ReviewLink";
import { useReviewComposer } from "@/features/reviews/hooks";
import { type ReviewSubjectKind, toFormValues } from "@/features/reviews/types";

export interface ReviewActionContainerProps {
  kind: ReviewSubjectKind;
  subjectId: number;
  slug: string;
  subjectName: string;
}

// The review link that sits on an order line or a finished booking.
export function ReviewActionContainer({
  kind,
  subjectId,
  slug,
  subjectName,
}: ReviewActionContainerProps) {
  const subject = useMemo(
    () => ({ kind, id: subjectId, slug }),
    [kind, slug, subjectId],
  );
  const {
    canReview,
    isOpen,
    isSaving,
    isUploading,
    myReview,
    open,
    setIsOpen,
    submit,
    upload,
  } = useReviewComposer(subject, subjectName);
  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);

  if (!canReview) return null;

  const hasMine = myReview !== null;
  const defaults = toFormValues(myReview);

  return (
    <>
      <ReviewLink
        label={hasMine ? "Edit your review" : "Review"}
        onClick={open}
      />
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
          onSubmit={submit}
          onUploadPhoto={upload}
          onCancel={handleClose}
        />
      </ReviewDialog>
    </>
  );
}
