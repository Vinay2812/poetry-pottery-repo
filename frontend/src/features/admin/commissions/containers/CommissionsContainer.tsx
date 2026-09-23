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
  CommissionRequestsDocument,
  CommissionStatus,
  MarkCommissionRequestReadDocument,
  SendWhatsAppReplyDocument,
  SetCommissionRequestStatusDocument,
} from "@/graphql/generated/graphql";

import {
  toErrorMessage,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import {
  AdminPageHeader,
  AdminPagination,
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
  enumOptions,
} from "@/features/admin/ui";

import { CommissionDrawer } from "@/features/admin/commissions/components/CommissionDrawer";
import { CommissionsTable } from "@/features/admin/commissions/components/CommissionsTable";
import {
  applyCommissionPatch,
  COMMISSIONS_PAGE_SIZE,
  type CommissionRow,
  describeBrief,
  toCommissionRow,
  toCommissionStatus,
  toWhatsAppHref,
} from "@/features/admin/commissions/types";
import { toWhatsAppBody } from "@/features/layout";

const STATUS_OPTIONS = enumOptions(CommissionStatus);

export function CommissionsContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.search ?? "";
  const statusValue = values.status ?? "";
  const status = toCommissionStatus(values.status);

  const commitSearch = useCallback(
    (value: string) => patch({ search: value === "" ? null : value }),
    [patch],
  );
  const [searchDraft, setSearchDraft] = useSearchDraft(search, commitSearch);

  const { data, previousData, loading, refetch } = useQuery(
    CommissionRequestsDocument,
    {
      variables: {
        filter: {
          search: search === "" ? null : search,
          status,
          page,
          limit: COMMISSIONS_PAGE_SIZE,
        },
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const [markRead] = useMutation(MarkCommissionRequestReadDocument);
  const [setStatus] = useMutation(SetCommissionRequestStatusDocument);
  const [sendWhatsAppReply] = useMutation(SendWhatsAppReplyDocument);

  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const result = data?.commissionRequests ?? previousData?.commissionRequests;

  const rows = useMemo<CommissionRow[]>(
    () => (result?.items ?? []).map(toCommissionRow),
    [result],
  );

  const [optimisticRows, patchRows] = useOptimistic(rows, applyCommissionPatch);

  const openRow = optimisticRows.find((row) => row.id === openId) ?? null;

  // Opening a brief is the studio reading it, so the unread mark comes off there.
  const handleOpen = useCallback(
    (id: string) => {
      setOpenId(id);
      const row = optimisticRows.find((item) => item.id === id);
      if (!row || row.isRead) return;
      startTransition(async () => {
        patchRows({ kind: "read", id });
        try {
          await markRead({ variables: { id } });
          await refetch();
        } catch (error) {
          toast.error(toErrorMessage(error));
        }
      });
    },
    [markRead, optimisticRows, patchRows, refetch],
  );

  const whatsAppHref = openRow
    ? toWhatsAppHref(openRow.phone, openRow.name, openRow.pieceType)
    : null;

  // The reply is copied to the customer's email in the background; the link opens regardless.
  const handleWhatsAppClick = useCallback(() => {
    const body = whatsAppHref === null ? null : toWhatsAppBody(whatsAppHref);
    if (!openRow || body === null) return;
    sendWhatsAppReply({
      variables: {
        input: {
          kind: "commission-reply",
          body,
          to_email: openRow.email,
          to_phone: openRow.phone,
          reference: openRow.id,
        },
      },
    }).catch(() => undefined);
  }, [openRow, sendWhatsAppReply, whatsAppHref]);

  const handleStatusChange = useCallback(
    (next: CommissionStatus) => {
      const id = openId;
      if (id === null) return;
      setBusyId(id);
      startTransition(async () => {
        patchRows({ kind: "status", id, status: next });
        try {
          await setStatus({ variables: { id, status: next } });
          await refetch();
          toast.success("Brief moved");
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setBusyId(null);
        }
      });
    },
    [openId, patchRows, refetch, setStatus],
  );

  const pageInfo = result?.page_info;
  const hasFilters = search !== "" || status !== null;

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
        title="Commissions"
        description="Briefs for pieces that do not exist yet."
        actions={null}
      />

      <AdminToolbar>
        <AdminSearchField
          id="commissions-search"
          label="Search"
          placeholder="Name, email or piece"
          value={searchDraft}
          onChange={setSearchDraft}
        />
        <AdminSelectFilter
          id="commissions-status"
          label="Status"
          anyLabel="Any status"
          options={STATUS_OPTIONS}
          value={statusValue}
          onChange={(value) => patch({ status: value === "" ? null : value })}
        />
      </AdminToolbar>

      <CommissionsTable
        rows={optimisticRows}
        isBusy={isPending || (loading && result !== undefined)}
        busyId={busyId}
        emptyMessage={
          hasFilters ? "No briefs match that search" : "No briefs yet"
        }
        onOpen={handleOpen}
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

      {openRow && (
        <CommissionDrawer
          isOpen
          name={openRow.name}
          email={openRow.email}
          phone={openRow.phone}
          briefLine={describeBrief(
            openRow.pieceType,
            openRow.size,
            openRow.glaze,
          )}
          carvedWords={openRow.carvedWords}
          notes={openRow.notes}
          referenceImageUrls={openRow.referenceImageUrls}
          status={openRow.status}
          whatsAppHref={whatsAppHref}
          isBusy={busyId === openRow.id}
          onStatusChange={handleStatusChange}
          onWhatsAppClick={handleWhatsAppClick}
          onOpenChange={(isOpen) => {
            if (!isOpen) setOpenId(null);
          }}
        />
      )}
    </div>
  );
}
