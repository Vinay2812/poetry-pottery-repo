"use client";

import { useCallback, useMemo, useOptimistic } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminWorkshopBookingsDocument,
  RegistrationStatus,
  SetWorkshopBookingStatusDocument,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { formatDate, formatInr } from "@/lib/format";
import { useReasonAction } from "@/lib/use-reason-action";
import { toRegistrationStatusLabel } from "@/lib/registration-status";

import { useAdminQueryState, useSearchDraft } from "@/features/admin/shell";
import {
  AdminDateFilter,
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
  AdminPersonFilterNotice,
  usePersonFilter,
} from "@/features/admin/people";

import {
  WorkshopBookingsTable,
  type WorkshopBookingRow,
} from "@/features/admin/workshops/components/WorkshopBookingsTable";
import {
  applyBookingStatus,
  BOOKINGS_PAGE_SIZE,
  describeSessionDays,
  describeSessionSize,
  toRangeEnd,
  toRangeStart,
} from "@/features/admin/workshops/types";

export interface WorkshopBookingsContainerProps {
  configId: number;
  timezone: string;
}

interface BookingMove {
  id: string;
  status: RegistrationStatus;
}

const STATUS_OPTIONS = registrationStatusOptions();

export function WorkshopBookingsContainer({
  configId,
  timezone,
}: WorkshopBookingsContainerProps) {
  const { values, page, isPending: isNavigating, patch } = useAdminQueryState();
  const search = values.search ?? "";
  const status = values.status ?? "";
  const from = values.from ?? "";
  const to = values.to ?? "";
  const { personId, personName } = usePersonFilter(values.user);

  const { data, previousData, loading, error, refetch } = useQuery(
    AdminWorkshopBookingsDocument,
    {
      variables: {
        filter: {
          config_id: configId,
          user_id: personId,
          status: toRegistrationStatus(status),
          search: search || null,
          from: toRangeStart(from, timezone) || null,
          to: toRangeEnd(to, timezone) || null,
          page,
          limit: BOOKINGS_PAGE_SIZE,
        },
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const [setStatus] = useMutation(SetWorkshopBookingStatusDocument);
  const result =
    data?.adminWorkshopBookings ?? previousData?.adminWorkshopBookings;
  const items = useMemo(() => result?.items ?? [], [result]);
  const [optimisticItems, patchItems] = useOptimistic(
    items,
    applyBookingStatus,
  );

  const handleSearch = useCallback(
    (value: string) => patch({ search: value || null }),
    [patch],
  );
  const [searchDraft, onSearchChange] = useSearchDraft(search, handleSearch);

  const rows = useMemo<WorkshopBookingRow[]>(
    () =>
      optimisticItems.map((item) => ({
        id: item.booking.id,
        personName: toPersonName(item.customer.name, item.customer.email),
        personEmail: item.customer.email,
        sessionLines: describeSessionDays(item.booking.slots, timezone),
        sizeLabel: describeSessionSize(
          item.booking.hours,
          item.booking.participants,
        ),
        totalLabel: formatInr(item.booking.total),
        statusLabel: toRegistrationStatusLabel(item.booking.status),
        statusTone: registrationStatusTone(item.booking.status),
        closingNote: describeClosing(item.booking.cancel_reason),
        note: item.booking.note,
        requestedLabel: formatDate(item.booking.created_at),
        actions: toRegistrationActions(
          item.booking.status,
          item.next_statuses,
          "wheel",
          item.booking.total === 0,
        ),
      })),
    [optimisticItems, timezone],
  );

  const move = useReasonAction({
    patch: ({ target, reason }) =>
      patchItems({ ...target, reason: reason ?? null }),
    // The payload is one row; the list needs a fresh take on what is next.
    run: ({ target, reason }) =>
      setStatus({
        variables: { id: target.id, status: target.status, reason },
      }),
    refresh: refetch,
    policy: (target: BookingMove) =>
      registrationActionNeedsReason(target.status) ? "required" : "none",
    requiredMessage: "Tell them why, in a line",
    messages: {
      success: ({ target }) =>
        `Booking updated: ${toRegistrationStatusLabel(target.status)}`,
      failure: "The booking could not be moved",
    },
  });

  const startMove = move.start;
  const handleAction = useCallback(
    (id: string, next: RegistrationStatus) => startMove({ id, status: next }),
    [startMove],
  );

  const pageInfo = result?.page_info;
  const closingStatus = move.target?.status;
  const closing =
    closingStatus && registrationActionNeedsReason(closingStatus)
      ? registrationClosingDialog(closingStatus, "wheel")
      : null;

  // Only a successful answer earns the empty row.
  const loadError =
    error && !data
      ? describeError(error, "The wheel sessions could not be loaded.")
      : null;

  return (
    <section aria-labelledby="wheel-sessions" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2
          id="wheel-sessions"
          className="font-display text-xl leading-none tracking-tight"
        >
          Sessions
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Who has asked for the wheel, and where each request stands.{" "}
          {registrationHoldNote("wheel")}
        </p>
      </div>
      <AdminToolbar>
        <AdminSearchField
          id="bookings-search"
          label="Search"
          placeholder="Email or booking ID"
          value={searchDraft}
          onChange={onSearchChange}
        />
        <AdminSelectFilter
          id="bookings-status"
          label="Status"
          anyLabel="Any status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(value) => patch({ status: value || null })}
        />
        <AdminDateFilter
          id="bookings-from"
          label="From"
          value={from}
          onChange={(value) => patch({ from: value || null })}
        />
        <AdminDateFilter
          id="bookings-to"
          label="To"
          value={to}
          onChange={(value) => patch({ to: value || null })}
        />
      </AdminToolbar>
      {personId !== null && (
        <AdminPersonFilterNotice
          line={
            personName ? `Bookings by ${personName}` : "Bookings by one person"
          }
          onClear={() => patch({ user: null })}
        />
      )}
      {loadError ? (
        <AdminLoadError
          message={loadError}
          isRetrying={loading}
          onRetry={retryQuery(refetch)}
        />
      ) : (
        <>
          <WorkshopBookingsTable
            rows={rows}
            isBusy={isNavigating || move.isPending}
            busyId={move.pending?.id ?? null}
            onAction={handleAction}
          />
          <AdminPagination
            page={pageInfo?.page ?? page}
            limit={pageInfo?.limit ?? BOOKINGS_PAGE_SIZE}
            total={pageInfo?.total ?? 0}
            hasMore={pageInfo?.has_more ?? false}
            onPageChange={(next) => patch({ page: String(next) })}
          />
        </>
      )}
      <AdminReasonDialog
        isOpen={closing !== null}
        title={closing?.title ?? ""}
        description="Tell them why, in a line."
        fieldLabel="Reason"
        hint="The guest reads this, so keep it kind"
        placeholder="The wheel is booked that afternoon"
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
