"use client";

import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";

import { toast } from "sonner";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminStudioVisitsDocument,
  CancelStudioVisitDocument,
} from "@/graphql/generated/graphql";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  toErrorMessage,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
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

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const result = data?.adminStudioVisits ?? previousData?.adminStudioVisits;

  const rows = useMemo<VisitRow[]>(
    () => (result?.items ?? []).map(toVisitRow),
    [result],
  );

  const [optimisticRows, patchRows] = useOptimistic(rows, applyVisitPatch);

  const handleCancelConfirm = useCallback(() => {
    const id = pendingId;
    if (id === null) return;
    const note = reason.trim();
    setPendingId(null);
    setBusyId(id);
    startTransition(async () => {
      patchRows({ kind: "cancel", id, at: new Date().toISOString() });
      try {
        await cancelVisit({
          variables: { id, reason: note === "" ? null : note },
        });
        await refetch();
        toast.success("Visit cancelled and the window is free again");
      } catch (error) {
        toast.error(toErrorMessage(error));
      } finally {
        setBusyId(null);
        setReason("");
      }
    });
  }, [cancelVisit, patchRows, pendingId, reason, refetch]);

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
        busyId={busyId}
        emptyMessage={
          hasFilters ? "No visits match that search" : "Nobody is coming by yet"
        }
        onCancel={setPendingId}
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
        isOpen={pendingId !== null}
        title="Cancel this visit?"
        description="The window goes back on offer and the visitor is told, if they left an address."
        fieldLabel="Why"
        hint="Optional. It goes into the email."
        placeholder="The kiln is running that morning"
        value={reason}
        error={undefined}
        confirmLabel="Cancel visit"
        isDestructive
        isRequired={false}
        isBusy={busyId !== null}
        onValueChange={setReason}
        onConfirm={handleCancelConfirm}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPendingId(null);
            setReason("");
          }
        }}
      />
    </div>
  );
}
