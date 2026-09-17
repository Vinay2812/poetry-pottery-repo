"use client";

import {
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
} from "@/features/admin/ui";

import {
  RATING_OPTIONS,
  SUBJECT_KIND_OPTIONS,
  VISIBILITY_OPTIONS,
} from "@/features/admin/reviews/types";

export interface ReviewsFiltersProps {
  search: string;
  subjectKind: string;
  rating: string;
  visibility: string;
  onSearchChange: (value: string) => void;
  onSubjectKindChange: (value: string) => void;
  onRatingChange: (value: string) => void;
  onVisibilityChange: (value: string) => void;
}

export function ReviewsFilters({
  search,
  subjectKind,
  rating,
  visibility,
  onSearchChange,
  onSubjectKindChange,
  onRatingChange,
  onVisibilityChange,
}: ReviewsFiltersProps) {
  return (
    <AdminToolbar>
      <AdminSearchField
        id="reviews-search"
        label="Search"
        placeholder="Review text, author or subject"
        value={search}
        onChange={onSearchChange}
      />
      <AdminSelectFilter
        id="reviews-subject-kind"
        label="Left on"
        anyLabel="Anything"
        options={SUBJECT_KIND_OPTIONS}
        value={subjectKind}
        onChange={onSubjectKindChange}
      />
      <AdminSelectFilter
        id="reviews-rating"
        label="Rating"
        anyLabel="Any rating"
        options={RATING_OPTIONS}
        value={rating}
        onChange={onRatingChange}
      />
      <AdminSelectFilter
        id="reviews-visibility"
        label="Visibility"
        anyLabel="Any"
        options={VISIBILITY_OPTIONS}
        value={visibility}
        onChange={onVisibilityChange}
      />
    </AdminToolbar>
  );
}
