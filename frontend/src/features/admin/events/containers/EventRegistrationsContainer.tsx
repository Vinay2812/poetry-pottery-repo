"use client";

import { useCallback, useMemo, useOptimistic } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminEventRegistrationsDocument,
  RegistrationStatus,
  SetRegistrationStatusDocument,
} from "@/graphql/generated/graphql";

import { formatDate, formatInr } from "@/lib/format";
import { useReasonAction } from "@/lib/use-reason-action";

import {
  formatEnumLabel,
  toPageNumber,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import {
  AdminPagination,
  AdminReasonDialog,
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
  enumOptions,
  registrationActionLabel,
  registrationActionNeedsReason,
  registrationStatusTone,
  toPersonName,
  toRegistrationStatus,
} from "@/features/admin/ui";

import {
  EventRegistrationsTable,
  type RegistrationTableRow,
} from "@/features/admin/events/components/EventRegistrationsTable";
const PAGE_SIZE = 20;
const STATUS_OPTIONS = enumOptions(RegistrationStatus);

interface StatusPatch {
  id: string;
  status: RegistrationStatus;
}

/** The row moves at once; its buttons wait for the refetch to say what comes next. */
function applyStatusPatch(
  rows: RegistrationTableRow[],
  patch: StatusPatch,
): RegistrationTableRow[] {
  return rows.map((row) => {
    if (row.id !== patch.id) return row;
    return {
      ...row,
      statusLabel: formatEnumLabel(patch.status),
      statusTone: registrationStatusTone(patch.status),
      nextStatuses: [],
    };
  });
}

export interface EventRegistrationsContainerProps {
  eventId: number;
  isEventCancelled: boolean;
}

export function EventRegistrationsContainer({
  eventId,
  isEventCancelled,
}: EventRegistrationsContainerProps) {
  const { values, isPending, patch } = useAdminQueryState();
  const search = values.reg_search ?? "";
  const status = values.reg_status ?? "";
  const page = toPageNumber(values.reg_page);

  // Every registration filter resets its own page; the event page has no page key of its own.
  const commitSearch = useCallback(
    (value: string) => patch({ reg_search: value || null, reg_page: null }),
    [patch],
  );
  const [searchDraft, handleSearchChange] = useSearchDraft(
    search,
    commitSearch,
  );

  const { data, previousData, loading, refetch } = useQuery(
    AdminEventRegistrationsDocument,
    {
      variables: {
        filter: {
          event_id: eventId,
          search: search || null,
          status: toRegistrationStatus(status),
          page,
          limit: PAGE_SIZE,
        },
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const [setRegistrationStatus] = useMutation(SetRegistrationStatusDocument);

  const result =
    data?.adminEventRegistrations ?? previousData?.adminEventRegistrations;

  const rows = useMemo<RegistrationTableRow[]>(
    () =>
      (result?.items ?? []).map((entry) => ({
        id: entry.registration.id,
        personName: toPersonName(entry.customer.name, entry.customer.email),
        personEmail: entry.customer.email,
        seatsLabel: String(entry.registration.seats),
        unitPriceLabel: formatInr(entry.registration.unit_price),
        totalLabel: formatInr(entry.registration.total),
        statusLabel: formatEnumLabel(entry.registration.status),
        statusTone: registrationStatusTone(entry.registration.status),
        note: entry.registration.note ?? "—",
        bookedLabel: formatDate(entry.registration.created_at),
        nextStatuses: entry.next_statuses,
      })),
    [result],
  );

  const [optimisticRows, patchRow] = useOptimistic(rows, applyStatusPatch);

  const move = useReasonAction({
    patch: ({ target }) => patchRow(target),
    // The event header counts seats, so it reads again once the row moves.
    run: ({ target, reason }) =>
      setRegistrationStatus({
        variables: { id: target.id, status: target.status, reason },
        refetchQueries: ["AdminEvent"],
      }),
    refresh: refetch,
    policy: (target: StatusPatch) =>
      registrationActionNeedsReason(target.status) ? "required" : "none",
    requiredMessage: "Say why, in a sentence the person can read",
    messages: {
      success: ({ target }) =>
        `Registration ${formatEnumLabel(target.status).toLowerCase()}`,
      failure: "The registration could not be moved",
    },
  });

  const startMove = move.start;
  const handleAction = useCallback(
    (id: string, status: RegistrationStatus) => startMove({ id, status }),
    [startMove],
  );

  const pageInfo = result?.page_info;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="border-b border-ash pb-3 font-display text-xl leading-none tracking-tight">
        Registrations
      </h2>
      <AdminToolbar>
        <AdminSearchField
          id="registrations-search"
          label="Search"
          placeholder="Name or email"
          value={searchDraft}
          onChange={handleSearchChange}
        />
        <AdminSelectFilter
          id="registrations-status"
          label="Status"
          anyLabel="Any status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(value) =>
            patch({ reg_status: value || null, reg_page: null })
          }
        />
      </AdminToolbar>
      <EventRegistrationsTable
        rows={optimisticRows}
        isBusy={isPending || loading}
        isLocked={isEventCancelled}
        busyId={move.pending?.id ?? null}
        onAction={handleAction}
      />
      <AdminPagination
        page={pageInfo?.page ?? page}
        limit={pageInfo?.limit ?? PAGE_SIZE}
        total={pageInfo?.total ?? 0}
        hasMore={pageInfo?.has_more ?? false}
        onPageChange={(next) => patch({ reg_page: String(next) })}
      />
      <AdminReasonDialog
        isOpen={move.target !== null}
        title={
          move.target?.status === RegistrationStatus.Rejected
            ? "Reject this registration?"
            : "Cancel this registration?"
        }
        description="The seats go back and the person is told."
        fieldLabel="Reason"
        hint="The person reads this, so keep it kind"
        placeholder="The session is full"
        value={move.reason}
        error={move.error}
        confirmLabel={
          move.target ? registrationActionLabel(move.target.status) : "Confirm"
        }
        isDestructive
        isRequired
        isBusy={move.isPending}
        onValueChange={move.setReason}
        onConfirm={move.confirm}
        onOpenChange={(isOpen) => {
          if (!isOpen) move.close();
        }}
      />
    </section>
  );
}
