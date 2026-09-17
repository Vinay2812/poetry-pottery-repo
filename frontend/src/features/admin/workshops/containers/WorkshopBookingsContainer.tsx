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
  RegistrationStatus,
  useAdminWorkshopBookingsQuery,
  useSetWorkshopBookingStatusMutation,
} from "@/graphql/generated/graphql";

import { formatDate, formatInr } from "@/lib/format";

import {
  formatEnumLabel,
  toErrorMessage,
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

interface PendingReason {
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

  const { data, previousData, refetch } = useAdminWorkshopBookingsQuery({
    variables: {
      filter: {
        config_id: configId,
        status: toRegistrationStatus(status),
        search: search || null,
        from: toRangeStart(from, timezone) || null,
        to: toRangeEnd(to, timezone) || null,
        page,
        limit: BOOKINGS_PAGE_SIZE,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const [setStatus] = useSetWorkshopBookingStatusMutation();
  const result =
    data?.adminWorkshopBookings ?? previousData?.adminWorkshopBookings;
  const items = useMemo(() => result?.items ?? [], [result]);
  const [optimisticItems, patchItems] = useOptimistic(
    items,
    applyBookingStatus,
  );
  const [isSaving, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingReason, setPendingReason] = useState<PendingReason | null>(
    null,
  );
  const [reason, setReason] = useState("");

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

  const applyStatus = useCallback(
    (id: string, next: RegistrationStatus, reason: string | null) => {
      setBusyId(id);
      startTransition(async () => {
        patchItems({ id, status: next });
        try {
          await setStatus({ variables: { id, status: next, reason } });
          // The payload is one row; the list needs a fresh take on what is next.
          await refetch();
          setPendingReason(null);
          setReason("");
          toast.success(`Booking ${formatEnumLabel(next).toLowerCase()}`);
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setBusyId(null);
        }
      });
    },
    [patchItems, refetch, setStatus],
  );

  const handleAction = useCallback(
    (id: string, next: RegistrationStatus) => {
      if (registrationActionNeedsReason(next)) {
        setReason("");
        setPendingReason({ id, status: next });
        return;
      }
      applyStatus(id, next, null);
    },
    [applyStatus],
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
      <WorkshopBookingsTable
        rows={rows}
        isBusy={isNavigating || isSaving}
        busyId={busyId}
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
        isOpen={pendingReason !== null}
        title={
          pendingReason?.status === RegistrationStatus.Rejected
            ? "Turn this booking down?"
            : "Cancel this booking?"
        }
        description="Tell them why, in a line."
        fieldLabel="Reason"
        hint="The guest reads this, so keep it kind"
        placeholder="The wheel is booked that afternoon"
        value={reason}
        error={undefined}
        confirmLabel={
          pendingReason ? registrationActionLabel(pendingReason.status) : ""
        }
        isDestructive
        isRequired
        isBusy={busyId !== null}
        onValueChange={setReason}
        onConfirm={() => {
          if (pendingReason) {
            applyStatus(pendingReason.id, pendingReason.status, reason.trim());
          }
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingReason(null);
        }}
      />
    </section>
  );
}
