"use client";

import { useCallback, useMemo, useOptimistic } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminEventRegistrationsDocument,
  RegistrationStatus,
  SetRegistrationStatusDocument,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { formatDate, formatInr, pluralize } from "@/lib/format";
import { useReasonAction } from "@/lib/use-reason-action";
import { toRegistrationStatusLabel } from "@/lib/registration-status";

import {
  toPageNumber,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import {
  AdminLoadError,
  AdminPagination,
  AdminReasonDialog,
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
  describeClosing,
  registrationActionNeedsReason,
  registrationClosingDialog,
  registrationHoldNote,
  registrationStatusOptions,
  registrationStatusTone,
  retryQuery,
  toPersonName,
  toRegistrationActions,
  toRegistrationStatus,
} from "@/features/admin/ui";

import {
  EventRegistrationsTable,
  type RegistrationTableRow,
} from "@/features/admin/events/components/EventRegistrationsTable";
import { applyRegistrationStatus } from "@/features/admin/events/types";
const PAGE_SIZE = 20;
const STATUS_OPTIONS = registrationStatusOptions();

interface StatusPatch {
  id: string;
  status: RegistrationStatus;
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

  const { data, previousData, loading, error, refetch } = useQuery(
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

  const items = useMemo(() => result?.items ?? [], [result]);
  const [optimisticItems, patchItems] = useOptimistic(
    items,
    applyRegistrationStatus,
  );

  const rows = useMemo<RegistrationTableRow[]>(
    () =>
      optimisticItems.map((entry) => ({
        id: entry.registration.id,
        personName: toPersonName(entry.customer.name, entry.customer.email),
        personEmail: entry.customer.email,
        requestedLabel: formatDate(entry.registration.created_at),
        seatsLabel: pluralize(entry.registration.seats, "seat"),
        totalLabel: formatInr(entry.registration.total),
        statusLabel: toRegistrationStatusLabel(
          entry.registration.status,
          entry.registration.total === 0,
        ),
        statusTone: registrationStatusTone(entry.registration.status),
        closingNote: describeClosing(entry.registration.cancel_reason),
        note: entry.registration.note,
        actions: toRegistrationActions(
          entry.registration.status,
          entry.next_statuses,
          "seat",
          entry.registration.total === 0,
        ),
      })),
    [optimisticItems],
  );

  const move = useReasonAction({
    patch: ({ target, reason }) =>
      patchItems({ ...target, reason: reason ?? null }),
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
        // A free seat is never moved to Approved, so the paid wording always fits here.
        `Registration updated: ${toRegistrationStatusLabel(target.status, false)}`,
      failure: "The registration could not be moved",
    },
  });

  const startMove = move.start;
  const handleAction = useCallback(
    (id: string, status: RegistrationStatus) => startMove({ id, status }),
    [startMove],
  );

  const pageInfo = result?.page_info;
  const closingStatus = move.target?.status;
  const closing =
    closingStatus && registrationActionNeedsReason(closingStatus)
      ? registrationClosingDialog(closingStatus, "seat")
      : null;

  // Only a successful answer earns the empty row.
  const loadError =
    error && !data
      ? describeError(error, "The seats could not be loaded.")
      : null;

  return (
    <section aria-labelledby="event-seats" className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 border-b border-ash pb-3">
        <h2
          id="event-seats"
          className="font-display text-xl leading-none tracking-tight"
        >
          Event seats
        </h2>
        <p className="text-[13px] text-muted-foreground">
          {registrationHoldNote("seat")}
        </p>
      </div>
      <AdminToolbar>
        <AdminSearchField
          id="registrations-search"
          label="Search"
          placeholder="Email or registration ID"
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
      {loadError ? (
        <AdminLoadError
          message={loadError}
          isRetrying={loading}
          onRetry={retryQuery(refetch)}
        />
      ) : (
        <>
          <EventRegistrationsTable
            rows={rows}
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
        </>
      )}
      <AdminReasonDialog
        isOpen={closing !== null}
        title={closing?.title ?? ""}
        description="The seats go back and the person is told."
        fieldLabel="Reason"
        hint="The person reads this, so keep it kind"
        placeholder="The session is full"
        value={move.reason}
        error={move.error}
        confirmLabel={closing?.confirmLabel ?? ""}
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
