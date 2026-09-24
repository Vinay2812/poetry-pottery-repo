"use client";

import { useCallback, useMemo, useOptimistic } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminWorkshopBookingsDocument,
  RegistrationStatus,
  SetWorkshopBookingStatusDocument,
} from "@/graphql/generated/graphql";

import { formatDate, formatInr } from "@/lib/format";
import { useReasonAction } from "@/lib/use-reason-action";

import {
  formatEnumLabel,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import {
  AdminDateFilter,
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
  describeSession,
  formatHoursLabel,
  formatParticipantsLabel,
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

const STATUS_OPTIONS = enumOptions(RegistrationStatus);

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

  const { data, previousData, refetch } = useQuery(
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
        sessionLabel: describeSession(
          item.booking.starts_at,
          item.booking.ends_at,
        ),
        hoursLabel: formatHoursLabel(item.booking.hours),
        participantsLabel: formatParticipantsLabel(item.booking.participants),
        totalLabel: formatInr(item.booking.total),
        statusLabel: formatEnumLabel(item.booking.status),
        statusTone: registrationStatusTone(item.booking.status),
        noteLabel: item.booking.note ?? "—",
        bookedLabel: formatDate(item.booking.created_at),
        actions: item.next_statuses.map((next) => ({
          status: next,
          label: registrationActionLabel(next),
        })),
      })),
    [optimisticItems],
  );

  const move = useReasonAction({
    patch: ({ target }) => patchItems(target),
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
        `Booking ${formatEnumLabel(target.status).toLowerCase()}`,
      failure: "The booking could not be moved",
    },
  });

  const startMove = move.start;
  const handleAction = useCallback(
    (id: string, next: RegistrationStatus) => startMove({ id, status: next }),
    [startMove],
  );

  const pageInfo = result?.page_info;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-xl leading-none tracking-tight">
          Bookings
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Who has asked for the wheel, and where each request stands.
        </p>
      </div>
      <AdminToolbar>
        <AdminSearchField
          id="bookings-search"
          label="Search"
          placeholder="Name or email"
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
      <AdminReasonDialog
        isOpen={move.target !== null}
        title={
          move.target?.status === RegistrationStatus.Rejected
            ? "Turn this booking down?"
            : "Cancel this booking?"
        }
        description="Tell them why, in a line."
        fieldLabel="Reason"
        hint="The guest reads this, so keep it kind"
        placeholder="The wheel is booked that afternoon"
        value={move.reason}
        error={move.error}
        confirmLabel={
          move.target ? registrationActionLabel(move.target.status) : ""
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
