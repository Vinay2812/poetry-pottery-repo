import { z } from "zod";

export const MAX_REVIEW_BODY = 1000;
export const MAX_REVIEW_PHOTOS = 3;

export const reviewSchema = z.object({
  rating: z
    .number({ error: "Pick a rating" })
    .int()
    .min(1, "Pick a rating")
    .max(5, "Pick a rating"),
  body: z
    .string()
    .trim()
    .max(MAX_REVIEW_BODY, `Keep it to ${MAX_REVIEW_BODY} characters or fewer`),
  image_urls: z
    .array(z.string())
    .max(MAX_REVIEW_PHOTOS, `Up to ${MAX_REVIEW_PHOTOS} photos`),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
