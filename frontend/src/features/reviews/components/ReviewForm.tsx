"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useCallback, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_REVIEW_BODY,
  MAX_REVIEW_PHOTOS,
  type ReviewFormValues,
  reviewSchema,
} from "@/lib/validations/review";

import { RatingInput } from "@/features/reviews/components/RatingInput";
import { REVIEW_IMAGE_TYPES } from "@/features/reviews/types";

export interface ReviewFormProps {
  defaultRating: number;
  defaultBody: string;
  defaultPhotoUrls: string[];
  isSubmitting: boolean;
  isUploading: boolean;
  submitLabel: string;
  error: string | null;
  onSubmit: (values: ReviewFormValues) => void;
  onUploadPhoto: (file: File) => Promise<string | null>;
  onCancel: () => void;
}

export function ReviewForm({
  defaultRating,
  defaultBody,
  defaultPhotoUrls,
  isSubmitting,
  isUploading,
  submitLabel,
  error,
  onSubmit,
  onUploadPhoto,
  onCancel,
}: ReviewFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: defaultRating,
      body: defaultBody,
      image_urls: defaultPhotoUrls,
    },
  });
  const rating = useWatch({ control, name: "rating" });
  const body = useWatch({ control, name: "body" });
  const photoUrls = useWatch({ control, name: "image_urls" });

  const handleRatingChange = useCallback(
    (next: number) => {
      setValue("rating", next, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const handleFileChange = useCallback(
    async (file: File | undefined) => {
      if (fileRef.current) fileRef.current.value = "";
      if (!file) return;
      const url = await onUploadPhoto(file);
      if (!url) return;
      setValue("image_urls", [...photoUrls, url].slice(0, MAX_REVIEW_PHOTOS), {
        shouldDirty: true,
      });
    },
    [onUploadPhoto, photoUrls, setValue],
  );

  const handleRemovePhoto = useCallback(
    (url: string) => {
      setValue(
        "image_urls",
        photoUrls.filter((current) => current !== url),
        { shouldDirty: true },
      );
    },
    [photoUrls, setValue],
  );

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
    >
      <RatingInput
        name="review-rating"
        value={rating}
        error={errors.rating?.message}
        onChange={handleRatingChange}
      />

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="review-body"
          className="text-[13px] text-muted-foreground"
        >
          Your words (optional)
        </Label>
        <Textarea
          id="review-body"
          rows={5}
          maxLength={MAX_REVIEW_BODY}
          placeholder="How does it feel to use, how did it arrive…"
          aria-invalid={Boolean(errors.body)}
          {...register("body")}
        />
        <p className="text-[13px] text-muted-foreground tnum">
          {body.length}/{MAX_REVIEW_BODY}
        </p>
        {errors.body?.message && (
          <p role="alert" className="text-[13px] text-destructive">
            {errors.body.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] text-muted-foreground">
          Photos (up to {MAX_REVIEW_PHOTOS})
        </span>
        {photoUrls.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {photoUrls.map((url) => (
              <li key={url} className="flex flex-col gap-1">
                <span className="relative block size-16 overflow-hidden bg-white">
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(url)}
                  className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          ref={fileRef}
          id="review-photo"
          type="file"
          accept={REVIEW_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => void handleFileChange(event.target.files?.[0])}
        />
        {photoUrls.length < MAX_REVIEW_PHOTOS && (
          <Label
            htmlFor="review-photo"
            className="w-fit cursor-pointer border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
          >
            {isUploading ? "Adding…" : "Add a photo"}
          </Label>
        )}
      </div>

      {error && (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Posting…" : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
