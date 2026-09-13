import type {
  ProductReviewsQuery,
  ReviewEligibilityFieldsFragment,
  ReviewFieldsFragment,
  ReviewInput,
  ReviewSummaryFieldsFragment,
} from "@/graphql/generated/graphql";

import { formatDate } from "@/lib/format";
import type { ReviewFormValues } from "@/lib/validations/review";

export type ReviewData = ReviewFieldsFragment;
export type ReviewSummaryData = ReviewSummaryFieldsFragment;
export type ReviewEligibilityData = ReviewEligibilityFieldsFragment;
export type ReviewsResultData = ProductReviewsQuery["productReviews"];

export type ReviewSubjectKind = "product" | "event";

export interface ReviewSubject {
  kind: ReviewSubjectKind;
  id: number;
  slug: string;
}

export const REVIEWS_PAGE_SIZE = 5;
export const REVIEW_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_REVIEW_IMAGE_BYTES = 8 * 1024 * 1024;
const MIN_REVIEW_IMAGE_EDGE = 400;

export const PRODUCT_REVIEW_NOTE =
  "Reviews come from people who bought this piece";
export const EVENT_REVIEW_NOTE =
  "Reviews come from people who sat at the wheel";

export function toRatingLabel(rating: number): string {
  return rating === 1 ? "1 star" : `${rating} stars`;
}

function toAverageLabel(average: number): string {
  return average.toFixed(1);
}

export function toSummaryLine(average: number, count: number): string {
  if (count === 0) return "No reviews yet";
  const reviews = count === 1 ? "1 review" : `${count} reviews`;
  return `${toAverageLabel(average)} out of 5 · ${reviews}`;
}

export interface DistributionRow {
  rating: number;
  count: number;
  percent: number;
}

// Five rows, best first, each carrying the share of the total it fills.
export function toDistributionRows(
  distribution: number[],
  count: number,
): DistributionRow[] {
  return [5, 4, 3, 2, 1].map((rating) => {
    const rows = distribution[rating - 1] ?? 0;
    return {
      rating,
      count: rows,
      percent: count === 0 ? 0 : Math.round((rows / count) * 100),
    };
  });
}

export function toReviewDate(value: string): string {
  return formatDate(value);
}

export function toOneLine(body: string | null, limit = 120): string {
  const flat = (body ?? "").replace(/\s+/g, " ").trim();
  if (flat.length <= limit) return flat;
  return `${flat.slice(0, limit).trimEnd()}…`;
}

export function checkReviewFile(type: string, size: number): string | null {
  if (!REVIEW_IMAGE_TYPES.includes(type)) {
    return "Photos must be JPEG, PNG or WebP";
  }
  if (size > MAX_REVIEW_IMAGE_BYTES) {
    return "Photos must be under 8 MB";
  }
  return null;
}

export function checkReviewDimensions(
  width: number,
  height: number,
): string | null {
  return Math.min(width, height) < MIN_REVIEW_IMAGE_EDGE
    ? `Photos need at least ${MIN_REVIEW_IMAGE_EDGE}px on the shorter side`
    : null;
}

export function toReviewInput(values: ReviewFormValues): ReviewInput {
  return {
    rating: values.rating,
    body: values.body.trim() || null,
    image_urls: values.image_urls,
  };
}

export function toFormValues(review: ReviewData | null): ReviewFormValues {
  return {
    rating: review?.rating ?? 0,
    body: review?.body ?? "",
    image_urls: review?.image_urls ?? [],
  };
}

// The summary is recomputed from its own distribution so the pending list stays honest.
export function applyRatingChange(
  summary: ReviewSummaryData,
  added: number | null,
  removed: number | null,
): ReviewSummaryData {
  const distribution = [...summary.distribution];
  if (removed !== null) {
    const index = removed - 1;
    distribution[index] = Math.max(0, (distribution[index] ?? 0) - 1);
  }
  if (added !== null) {
    const index = added - 1;
    distribution[index] = (distribution[index] ?? 0) + 1;
  }
  const count = distribution.reduce((sum, rows) => sum + rows, 0);
  const total = distribution.reduce(
    (sum, rows, index) => sum + rows * (index + 1),
    0,
  );
  return {
    ...summary,
    distribution,
    count,
    average: count === 0 ? 0 : Math.round((total / count) * 10) / 10,
  };
}

export function toSubjectHref(subject: ReviewSubject): string {
  return subject.kind === "product"
    ? `/products/${subject.slug}`
    : `/events/${subject.slug}`;
}

export const DRAFT_REVIEW_ID = -1;

export interface ReviewDraftContext {
  author: ReviewData["author"];
  subjectName: string;
  subjectHref: string;
  createdAt: string;
}

// A pending review stands in for the real one until the refetched list answers.
export function toDraftReview(
  values: ReviewFormValues,
  previous: ReviewData | null,
  context: ReviewDraftContext,
): ReviewData {
  return {
    id: previous?.id ?? DRAFT_REVIEW_ID,
    rating: values.rating,
    body: values.body.trim() || null,
    image_urls: values.image_urls,
    created_at: previous?.created_at ?? context.createdAt,
    is_mine: true,
    subject_name: previous?.subject_name ?? context.subjectName,
    subject_href: previous?.subject_href ?? context.subjectHref,
    author: previous?.author ?? context.author,
  };
}

export function withReviewAdded(
  result: ReviewsResultData,
  review: ReviewData,
): ReviewsResultData {
  const items = result.items.filter((item) => item.id !== review.id);
  return {
    ...result,
    items: [review, ...items],
    page_info: { ...result.page_info, total: result.page_info.total + 1 },
    summary: applyRatingChange(result.summary, review.rating, null),
  };
}

export function withReviewUpdated(
  result: ReviewsResultData,
  review: ReviewData,
): ReviewsResultData {
  const previous = result.items.find((item) => item.id === review.id);
  return {
    ...result,
    items: result.items.map((item) => (item.id === review.id ? review : item)),
    summary: previous
      ? applyRatingChange(result.summary, review.rating, previous.rating)
      : result.summary,
  };
}

export function withReviewRemoved(
  result: ReviewsResultData,
  id: number,
): ReviewsResultData {
  const removed = result.items.find((item) => item.id === id);
  return {
    ...result,
    items: result.items.filter((item) => item.id !== id),
    page_info: {
      ...result.page_info,
      total: Math.max(0, result.page_info.total - 1),
    },
    summary: removed
      ? applyRatingChange(result.summary, null, removed.rating)
      : result.summary,
  };
}

export type ReviewAction =
  | { kind: "post"; review: ReviewData }
  | { kind: "edit"; review: ReviewData }
  | { kind: "remove"; id: number };

// A pending post, edit or delete lands on a copy of the list while the mutation runs.
export function applyReviewAction(
  result: ReviewsResultData | null,
  action: ReviewAction,
): ReviewsResultData | null {
  if (!result) return result;
  switch (action.kind) {
    case "post":
      return withReviewAdded(result, action.review);
    case "edit":
      return withReviewUpdated(result, action.review);
    case "remove":
      return withReviewRemoved(result, action.id);
  }
}
