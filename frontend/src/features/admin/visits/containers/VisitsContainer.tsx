"use client";

import { useCallback, useMemo, useOptimistic } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminStudioVisitsDocument,
  CancelStudioVisitDocument,
} from "@/graphql/generated/graphql";

import { type ReasonInput, useReasonAction } from "@/lib/use-reason-action";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { useAdminQueryState, useSearchDraft } from "@/features/admin/shell";
import {
  AdminDateFilter,
  AdminPageHeader,
  AdminPagination,
  AdminReasonDialog,
  AdminSearchField,
  AdminToolbar,
} from "@/features/admin/ui";

import { VisitsTable } from "@/features/admin/visits/components/VisitsTable";
import {
  applyVisitPatch,
  toVisitRow,
  toVisitsFilter,
  type VisitRow,
} from "@/features/admin/visits/types";

export function VisitsContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.search ?? "";
  const isCancelledShown = values.cancelled === "1";

  const filter = useMemo(() => toVisitsFilter(values, page), [values, page]);

  const commitSearch = useCallback(
    (value: string) => patch({ search: value === "" ? null : value }),
    [patch],
  );
  const [searchDraft, setSearchDraft] = useSearchDraft(search, commitSearch);

  const { data, previousData, loading, refetch } = useQuery(
    AdminStudioVisitsDocument,
    {
      variables: { filter },
      fetchPolicy: "cache-and-network",
    },
  );

  const [cancelVisit] = useMutation(CancelStudioVisitDocument);

  const result = data?.adminStudioVisits ?? previousData?.adminStudioVisits;

  const rows = useMemo<VisitRow[]>(
    () => (result?.items ?? []).map(toVisitRow),
    [result],
  );

  const [optimisticRows, patchRows] = useOptimistic(rows, applyVisitPatch);

  const cancel = useReasonAction({
    patch: ({ target }: ReasonInput<string>) =>
      patchRows({ kind: "cancel", id: target, at: new Date().toISOString() }),
    run: ({ target, reason }) =>
      cancelVisit({ variables: { id: target, reason } }),
    refresh: refetch,
    policy: () => "optional",
    requiredMessage: "Say why the visit is off",
    messages: {
      success: "Visit cancelled and the window is free again",
      failure: "The visit could not be cancelled",
    },
  });

  const pageInfo = result?.page_info;
  const hasFilters =
    search !== "" || values.from !== undefined || values.to !== undefined;

  if (!result && loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-20 animate-pulse bg-ash" />
        <div className="h-64 animate-pulse bg-ash" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Studio"
        title="Visits"
        description="Half hours booked to come and see the studio."
        actions={null}
      />

      <AdminToolbar>
        <AdminSearchField
          id="visits-search"
          label="Search"
          placeholder="Name or phone"
          value={searchDraft}
          onChange={setSearchDraft}
        />
        <AdminDateFilter
          id="visits-from"
          label="From"
          value={values.from ?? ""}
          onChange={(value) => patch({ from: value === "" ? null : value })}
        />
        <AdminDateFilter
          id="visits-to"
          label="To"
          value={values.to ?? ""}
          onChange={(value) => patch({ to: value === "" ? null : value })}
        />
        <Label
          htmlFor="visits-cancelled"
          className="flex h-9 items-center gap-2 text-[13px]"
        >
          <Checkbox
            id="visits-cancelled"
            checked={isCancelledShown}
            onCheckedChange={(checked) =>
              patch({ cancelled: checked === true ? "1" : null })
            }
          />
          Show cancelled
        </Label>
      </AdminToolbar>

      <VisitsTable
        rows={optimisticRows}
        isBusy={isPending || (loading && result !== undefined)}
        busyId={cancel.pending}
        emptyMessage={
          hasFilters ? "No visits match that search" : "Nobody is coming by yet"
        }
        onCancel={cancel.start}
      />

      {pageInfo && (
        <AdminPagination
          page={pageInfo.page}
          limit={pageInfo.limit}
          total={pageInfo.total}
          hasMore={pageInfo.has_more}
          onPageChange={(next) => patch({ page: String(next) })}
        />
      )}

      <AdminReasonDialog
        isOpen={cancel.target !== null}
        title="Cancel this visit?"
        description="The window goes back on offer and the visitor is told, if they left an address."
        fieldLabel="Why"
        hint="Optional. It goes into the email."
        placeholder="The kiln is running that morning"
        value={cancel.reason}
        error={cancel.error}
        confirmLabel="Cancel visit"
        isDestructive
        isRequired={false}
        isBusy={cancel.isPending}
        onValueChange={cancel.setReason}
        onConfirm={cancel.confirm}
        onOpenChange={(isOpen) => {
          if (!isOpen) cancel.close();
        }}
      />
    </div>
  );
}
