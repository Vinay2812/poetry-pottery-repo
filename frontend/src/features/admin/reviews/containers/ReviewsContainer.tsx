"use client";

import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import {
  useAdminReviewsQuery,
  useDeleteReviewAsAdminMutation,
  useSetReviewHiddenMutation,
} from "@/graphql/generated/graphql";

import {
  toErrorMessage,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import {
  AdminConfirmDialog,
  AdminPageHeader,
  AdminPagination,
} from "@/features/admin/ui";

import { ReviewsFilters } from "@/features/admin/reviews/components/ReviewsFilters";
import { ReviewsTable } from "@/features/admin/reviews/components/ReviewsTable";
import {
  applyReviewPatch,
  toReviewRow,
  toReviewsFilter,
} from "@/features/admin/reviews/types";

export function ReviewsContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const filter = useMemo(() => toReviewsFilter(values, page), [values, page]);
  const { data, previousData, loading, error, refetch } = useAdminReviewsQuery({
    variables: { filter },
    fetchPolicy: "cache-and-network",
  });
  const [setReviewHidden] = useSetReviewHiddenMutation();
  const [deleteReview] = useDeleteReviewAsAdminMutation();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

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

  const handleToggleHidden = useCallback(
    (id: number, isHidden: boolean) => {
      setBusyId(id);
      startTransition(async () => {
        patchRows({ kind: "hidden", id, isHidden });
        try {
          await setReviewHidden({ variables: { id, is_hidden: isHidden } });
          await refetch();
          toast.success(isHidden ? "Review hidden" : "Review is visible again");
        } catch (patchError) {
          toast.error(toErrorMessage(patchError));
        } finally {
          setBusyId(null);
        }
      });
    },
    [patchRows, refetch, setReviewHidden],
  );

  const handleConfirmDelete = useCallback(() => {
    const id = pendingDeleteId;
    if (id === null) return;
    setBusyId(id);
    startTransition(async () => {
      patchRows({ kind: "remove", id });
      try {
        await deleteReview({ variables: { id } });
        await refetch();
        setPendingDeleteId(null);
        toast.success("Review deleted");
      } catch (deleteError) {
        toast.error(toErrorMessage(deleteError));
      } finally {
        setBusyId(null);
      }
    });
  }, [deleteReview, patchRows, pendingDeleteId, refetch]);

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
        {error ? toErrorMessage(error) : "Reviews could not be loaded."}
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
