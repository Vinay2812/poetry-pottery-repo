import {
  type AdminReviewRowFragment,
  type AdminReviewsFilterInput,
  ReviewSubjectKind,
} from "@/graphql/generated/graphql";

import { formatDate, pluralize } from "@/lib/format";

import { formatEnumLabel, type QueryValues } from "@/features/admin/shell";
import type { AdminFilterOption, AdminStatusTone } from "@/features/admin/ui";

export const REVIEWS_PAGE_SIZE = 20;

export interface ReviewRow {
  id: number;
  rating: number;
  ratingLabel: string;
  subjectName: string;
  subjectHref: string | null;
  subjectKindLabel: string;
  authorName: string;
  body: string;
  photoUrls: string[];
  photosLabel: string;
  leftLabel: string;
  isHidden: boolean;
}

/** Screen readers get the number, sighted readers get the five marks. */
export function toRatingLabel(rating: number): string {
  return `${rating} out of 5`;
}

export function toVisibilityLabel(isHidden: boolean): string {
  return isHidden ? "Hidden" : "Visible";
}

export function toVisibilityTone(isHidden: boolean): AdminStatusTone {
  return isHidden ? "quiet" : "live";
}

export function toSubjectName(name: string | null): string {
  return name ?? "No longer listed";
}

export function toBodyText(body: string | null): string {
  const trimmed = body?.trim() ?? "";
  return trimmed === "" ? "Rating only" : trimmed;
}

export function toPhotosLabel(count: number): string {
  return count === 0 ? "No photos" : pluralize(count, "photo");
}

export function toReviewRow(item: AdminReviewRowFragment): ReviewRow {
  return {
    id: item.review.id,
    rating: item.review.rating,
    ratingLabel: toRatingLabel(item.review.rating),
    subjectName: toSubjectName(item.review.subject_name),
    subjectHref: item.review.subject_href,
    subjectKindLabel: formatEnumLabel(item.subject_kind),
    authorName: item.customer.name ?? item.customer.email,
    body: toBodyText(item.review.body),
    photoUrls: item.review.image_urls,
    photosLabel: toPhotosLabel(item.review.image_urls.length),
    leftLabel: formatDate(item.review.created_at),
    isHidden: item.is_hidden,
  };
}

export type ReviewPatch =
  | { kind: "hidden"; id: number; isHidden: boolean }
  | { kind: "remove"; id: number };

export function applyReviewPatch(
  rows: ReviewRow[],
  patch: ReviewPatch,
): ReviewRow[] {
  if (patch.kind === "remove") {
    return rows.filter((row) => row.id !== patch.id);
  }
  return rows.map((row) =>
    row.id === patch.id ? { ...row, isHidden: patch.isHidden } : row,
  );
}

export const SUBJECT_KIND_OPTIONS: AdminFilterOption[] = Object.values(
  ReviewSubjectKind,
).map((value) => ({ value, label: formatEnumLabel(value) }));

export const RATING_OPTIONS: AdminFilterOption[] = [5, 4, 3, 2, 1].map(
  (rating) => ({ value: String(rating), label: toRatingLabel(rating) }),
);

export const VISIBILITY_OPTIONS: AdminFilterOption[] = [
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
];

const SUBJECT_KINDS = new Set<string>(Object.values(ReviewSubjectKind));

export function toSubjectKind(
  value: string | undefined,
): ReviewSubjectKind | undefined {
  if (value === undefined || !SUBJECT_KINDS.has(value)) return undefined;
  return value as ReviewSubjectKind;
}

export function toRating(value: string | undefined): number | undefined {
  const rating = Number.parseInt(value ?? "", 10);
  return rating >= 1 && rating <= 5 ? rating : undefined;
}

export function toIsHidden(value: string | undefined): boolean | undefined {
  if (value === "hidden") return true;
  if (value === "visible") return false;
  return undefined;
}

/** The address bar is the only source of truth; anything unreadable is dropped. */
export function toReviewsFilter(
  values: QueryValues,
  page: number,
): AdminReviewsFilterInput {
  const filter: AdminReviewsFilterInput = { page, limit: REVIEWS_PAGE_SIZE };
  const search = values.search?.trim();
  if (search) filter.search = search;
  const subjectKind = toSubjectKind(values.subject_kind);
  if (subjectKind) filter.subject_kind = subjectKind;
  const rating = toRating(values.rating);
  if (rating) filter.rating = rating;
  const isHidden = toIsHidden(values.visibility);
  if (isHidden !== undefined) filter.is_hidden = isHidden;
  return filter;
}
