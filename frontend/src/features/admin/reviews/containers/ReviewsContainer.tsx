"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminReviewsDocument,
  DeleteReviewAsAdminDocument,
  SetReviewHiddenDocument,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { useOptimisticAction } from "@/lib/use-optimistic-action";

import { useAdminQueryState, useSearchDraft } from "@/features/admin/shell";
import {
  AdminConfirmDialog,
  AdminPageHeader,
  AdminPagination,
} from "@/features/admin/ui";
import {
  AdminPersonFilterNotice,
  usePersonFilter,
} from "@/features/admin/people";

import { ReviewsFilters } from "@/features/admin/reviews/components/ReviewsFilters";
import { ReviewsTable } from "@/features/admin/reviews/components/ReviewsTable";
import {
  applyReviewPatch,
  toReviewRow,
  toReviewsFilter,
} from "@/features/admin/reviews/types";

interface HiddenChange {
  id: number;
  isHidden: boolean;
}

export function ReviewsContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const filter = useMemo(() => toReviewsFilter(values, page), [values, page]);
  const { personId, personName } = usePersonFilter(values.user);
  const { data, previousData, loading, error, refetch } = useQuery(
    AdminReviewsDocument,
    {
      variables: { filter },
      fetchPolicy: "cache-and-network",
    },
  );
  const [setReviewHidden] = useMutation(SetReviewHiddenDocument);
  const [deleteReview] = useMutation(DeleteReviewAsAdminDocument);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const result = data?.adminReviews ?? previousData?.adminReviews;
  const rows = useMemo(() => (result?.items ?? []).map(toReviewRow), [result]);
  const [optimisticRows, patchRows] = useOptimistic(rows, applyReviewPatch);

  const handleSearchCommit = useCallback(
    (value: string) => {
      patch({ search: value || null });
    },
    [patch],
  );
  const [searchDraft, handleSearchChange] = useSearchDraft(
    values.search ?? "",
    handleSearchCommit,
  );

  const { execute: saveHidden, pending: pendingHidden } = useOptimisticAction({
    patch: (change: HiddenChange) =>
      patchRows({ kind: "hidden", id: change.id, isHidden: change.isHidden }),
    run: (change) =>
      setReviewHidden({
        variables: { id: change.id, is_hidden: change.isHidden },
      }),
    refresh: refetch,
    messages: {
      success: (change) =>
        change.isHidden ? "Review hidden" : "Review is visible again",
      failure: "The review could not be updated",
    },
  });

  const handleToggleHidden = useCallback(
    (id: number, isHidden: boolean) => saveHidden({ id, isHidden }),
    [saveHidden],
  );

  const { execute: removeReview, pending: pendingRemoveId } =
    useOptimisticAction({
      patch: (id: number) => patchRows({ kind: "remove", id }),
      run: (id) => deleteReview({ variables: { id } }),
      refresh: refetch,
      messages: {
        success: "Review deleted",
        failure: "The review could not be deleted",
      },
      onSuccess: () => setPendingDeleteId(null),
    });

  const handleConfirmDelete = useCallback(() => {
    if (pendingDeleteId !== null) removeReview(pendingDeleteId);
  }, [pendingDeleteId, removeReview]);

  const busyId = pendingHidden?.id ?? pendingRemoveId ?? null;

  const handleDeleteOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setPendingDeleteId(null);
  }, []);

  const handleDeleteRequest = useCallback((id: number) => {
    setPendingDeleteId(id);
  }, []);

  const handlePageChange = useCallback(
    (next: number) => {
      patch({ page: String(next) });
    },
    [patch],
  );

  if (!result && loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-20 animate-pulse bg-ash" />
        <div className="h-96 animate-pulse bg-ash" />
      </div>
    );
  }

  if (!result) {
    return (
      <p className="text-[13px]">
        {error
          ? describeError(error, "Reviews could not be loaded.")
          : "Reviews could not be loaded."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AdminPageHeader
        eyebrow="Studio"
        title="Reviews"
        description="What people wrote about the pieces and the sessions."
      />
      <ReviewsFilters
        search={searchDraft}
        subjectKind={values.subject_kind ?? ""}
        rating={values.rating ?? ""}
        visibility={values.visibility ?? ""}
        onSearchChange={handleSearchChange}
        onSubjectKindChange={(value) => patch({ subject_kind: value || null })}
        onRatingChange={(value) => patch({ rating: value || null })}
        onVisibilityChange={(value) => patch({ visibility: value || null })}
      />
      {personId !== null && (
        <AdminPersonFilterNotice
          line={
            personName ? `Reviews by ${personName}` : "Reviews by one person"
          }
          onClear={() => patch({ user: null })}
        />
      )}
      <ReviewsTable
        rows={optimisticRows}
        isBusy={loading || isPending}
        busyId={busyId}
        onToggleHidden={handleToggleHidden}
        onDelete={handleDeleteRequest}
      />
      <AdminPagination
        page={result.page_info.page}
        limit={result.page_info.limit}
        total={result.page_info.total}
        hasMore={result.page_info.has_more}
        onPageChange={handlePageChange}
      />
      <AdminConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete this review?"
        description="It leaves the storefront and this list for good. This cannot be undone."
        confirmLabel="Delete review"
        isDestructive
        isBusy={busyId !== null && busyId === pendingDeleteId}
        onConfirm={handleConfirmDelete}
        onOpenChange={handleDeleteOpenChange}
      />
    </div>
  );
}
