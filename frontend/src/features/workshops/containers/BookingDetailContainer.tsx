"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";

import { formatDateTime, formatInr, pluralize } from "@/lib/format";

import { PageShell } from "@/components/layout/PageShell";

import { SignInWall } from "@/features/auth";
import { buildWhatsAppUrl } from "@/features/layout/types";
import { BookingDetail } from "@/features/workshops/components/BookingDetail";
import type { CalendarDay } from "@/features/workshops/components/BookingCalendar";
import { CancelBookingDialog } from "@/features/workshops/components/CancelBookingDialog";
import { RescheduleDialog } from "@/features/workshops/components/RescheduleDialog";
import type { PickedSlot } from "@/features/workshops/components/PickedSlots";
import type { SlotOption } from "@/features/workshops/components/SlotList";
import {
  useAvailability,
  useCancelWorkshopBooking,
  useRescheduleWorkshopBooking,
  useWorkshopBooking,
} from "@/features/workshops/hooks";
import {
  applyBookingAction,
  BOOKING_STEPS,
  formatDateKey,
  formatHourRange,
  formatHours,
  formatMonth,
  groupSlotsByDay,
  isBookingClosed,
  isDayWithinSpan,
  isSameSelection,
  isSlotPickable,
  pickableSlots,
  type SessionFact,
  shiftMonth,
  type SlotInterval,
  slotsNeeded,
  spanNotice,
  togglePicked,
  toPickedSlots,
  toBookingStatusLabel,
  toBookingStatusTone,
  toBookingStepIndex,
  toDateKey,
  toMonthGrid,
  toMonthKey,
  toWhatsAppSessionMessage,
} from "@/features/workshops/types";

export interface BookingDetailContainerProps {
  bookingId: string;
  isJustPlaced: boolean;
  whatsappNumber: string;
}

export function BookingDetailContainer({
  bookingId,
  isJustPlaced,
  whatsappNumber,
}: BookingDetailContainerProps) {
  const { booking, isLoading, hasError, isSignedIn, refetch } =
    useWorkshopBooking(bookingId);
  const [optimisticBooking, applyBookingChange] = useOptimistic(
    booking,
    applyBookingAction,
  );
  const [, startTransition] = useTransition();
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const { cancel, isCancelling } = useCancelWorkshopBooking();
  const { reschedule, isRescheduling } = useRescheduleWorkshopBooking();

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [picked, setPicked] = useState<SlotInterval[]>([]);

  const configSlug = optimisticBooking?.config.slug ?? "";
  const timezone = optimisticBooking?.config.timezone ?? "Asia/Kolkata";
  const slotMinutes = optimisticBooking?.config.slot_minutes ?? 60;
  const spanAllowance = optimisticBooking?.config.slot_span_days ?? 1;
  const hours = optimisticBooking?.hours ?? 1;
  const participants = optimisticBooking?.participants ?? 1;
  const needed = slotsNeeded(hours, slotMinutes);
  const bookedSlots = optimisticBooking?.slots ?? [];
  const isUnchangedMove = isSameSelection(picked, bookedSlots);

  const { days } = useAvailability(configSlug, month, !isMoveOpen);
  const dayByKey = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );
  const todayKey = toDateKey(new Date(), timezone);

  const slotByStart = useMemo(
    () =>
      new Map(
        days.flatMap((day) => day.slots).map((slot) => [slot.starts_at, slot]),
      ),
    [days],
  );
  const pickedDateKeys = useMemo(
    () => picked.map((slot) => toDateKey(slot.starts_at, timezone)),
    [picked, timezone],
  );

  const weeks = useMemo<(CalendarDay | null)[][]>(
    () =>
      toMonthGrid(month).map((week) =>
        week.map((dateKey) => {
          if (!dateKey) return null;
          const day = dayByKey.get(dateKey);
          const wheelsFree = pickableSlots(day, participants).reduce(
            (most, slot) => Math.max(most, slot.remaining),
            0,
          );
          const isWithinSpan = isDayWithinSpan(
            dateKey,
            pickedDateKeys,
            spanAllowance,
          );
          return {
            dateKey,
            dayNumber: Number(dateKey.slice(8)),
            dayLabel: formatDateKey(dateKey),
            wheelsFree,
            pickedCount: pickedDateKeys.filter((key) => key === dateKey).length,
            isClosed: day?.is_closed ?? true,
            closedKind: day?.closed_kind ?? null,
            isPast: dateKey < todayKey,
            mutedReason: isWithinSpan ? null : spanNotice(spanAllowance),
          };
        }),
      ),
    [dayByKey, month, participants, pickedDateKeys, spanAllowance, todayKey],
  );

  const selectedDay = selectedDate ? dayByKey.get(selectedDate) : undefined;
  const slots = useMemo<SlotOption[]>(
    () =>
      (selectedDay?.slots ?? []).map((slot) => ({
        startsAt: slot.starts_at,
        label: formatHourRange(slot.starts_at, slot.ends_at, timezone),
        wheelsFree: slot.remaining,
        isDisabled: !isSlotPickable(slot, participants),
        reason: slot.is_available
          ? "Not enough wheels"
          : (slot.reason ?? "Not free"),
      })),
    [participants, selectedDay, timezone],
  );

  const pickedSlots = useMemo<PickedSlot[]>(
    () => toPickedSlots(picked, timezone),
    [picked, timezone],
  );

  const handleToggleSlot = useCallback(
    (startsAt: string) => {
      const slot = slotByStart.get(startsAt);
      if (!slot) return;
      setPicked((previous) => togglePicked(previous, slot, needed));
    },
    [needed, slotByStart],
  );

  const handleRemoveSlot = useCallback((startsAt: string) => {
    setPicked((previous) =>
      previous.filter((slot) => slot.starts_at !== startsAt),
    );
  }, []);

  // The dialog closes and the badge turns at once; a refusal rolls both back with a toast.
  const handleConfirmCancel = useCallback(() => {
    setIsCancelOpen(false);
    startTransition(async () => {
      applyBookingChange({
        kind: "cancel",
        reason,
        at: new Date().toISOString(),
      });
      await cancel(bookingId, reason);
    });
  }, [applyBookingChange, bookingId, cancel, reason]);

  const handleConfirmMove = useCallback(() => {
    if (picked.length !== needed || isUnchangedMove) return;
    const moved = [...picked];
    setIsMoveOpen(false);
    setPicked([]);
    setSelectedDate(null);
    startTransition(async () => {
      applyBookingChange({ kind: "reschedule", slots: moved });
      await reschedule(
        bookingId,
        moved.map((slot) => slot.starts_at),
      );
    });
  }, [
    applyBookingChange,
    bookingId,
    isUnchangedMove,
    needed,
    picked,
    reschedule,
  ]);

  // The picker opens on the hours the guest already has, so a move can keep most of them.
  const handleOpenMove = useCallback(() => {
    if (!optimisticBooking) return;
    const dateKey = toDateKey(optimisticBooking.starts_at, timezone);
    setMonth(toMonthKey(dateKey));
    setSelectedDate(dateKey);
    setPicked(
      optimisticBooking.slots.map((slot) => ({
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
      })),
    );
    setIsMoveOpen(true);
  }, [optimisticBooking, timezone]);

  const handleSelectDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
  }, []);

  if (isLoading) {
    return (
      <PageShell column="wide" className="py-8 md:py-12" isBusy>
        <div className="h-8 w-56 animate-pulse bg-ash" />
        <div className="mt-8 h-64 animate-pulse bg-ash/60" />
      </PageShell>
    );
  }
  if (!isSignedIn) {
    return (
      <SignInWall
        message="Sign in to see this session"
        onSignIn={() => openSignIn()}
      />
    );
  }
  if (hasError || !optimisticBooking) {
    return (
      <PageShell
        column="wide"
        className="flex flex-col items-start gap-3 py-16"
      >
        <h1 className="font-heading text-2xl tracking-tight">
          We could not find that session
        </h1>
        <button
          type="button"
          onClick={() => void refetch()}
          className="border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
        >
          Try again
        </button>
      </PageShell>
    );
  }

  const dates: Record<string, string | null> = {
    PENDING: formatDateTime(optimisticBooking.created_at),
    APPROVED: optimisticBooking.approved_at
      ? formatDateTime(optimisticBooking.approved_at)
      : null,
    CONFIRMED: optimisticBooking.confirmed_at
      ? formatDateTime(optimisticBooking.confirmed_at)
      : null,
  };
  const closed = isBookingClosed(optimisticBooking.status);
  const closedOn =
    optimisticBooking.cancelled_at ?? optimisticBooking.rejected_at;
  const closedLabel = closed
    ? `${toBookingStatusLabel(optimisticBooking.status)}${closedOn ? ` on ${formatDateTime(closedOn)}` : ""}${optimisticBooking.cancel_reason ? ` · ${optimisticBooking.cancel_reason}` : ""}`
    : null;
  const dayGroups = groupSlotsByDay(optimisticBooking.slots, timezone);
  const when = dayGroups
    .map((group) => `${group.dayLabel} ${group.timesLabel}`)
    .join("; ");
  const facts: SessionFact[] = [
    { label: "Session", value: optimisticBooking.config.name },
    ...dayGroups.map((group) => ({
      label: group.dayLabel,
      value: group.timesLabel,
    })),
    { label: "Duration", value: formatHours(optimisticBooking.hours) },
    {
      label: "You take home",
      value: `${pluralize(optimisticBooking.pieces_per_person * optimisticBooking.participants, "piece")}, fired and glazed`,
    },
  ];
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppUrl(
        whatsappNumber,
        toWhatsAppSessionMessage({
          bookingId: optimisticBooking.id,
          when,
          hours: optimisticBooking.hours,
          participants: optimisticBooking.participants,
          total: formatInr(optimisticBooking.total),
          guestName: user?.fullName ?? "",
        }),
      )
    : null;

  return (
    <>
      <BookingDetail
        bookingId={optimisticBooking.id}
        bookedOn={formatDateTime(optimisticBooking.created_at)}
        statusLabel={toBookingStatusLabel(optimisticBooking.status)}
        statusTone={toBookingStatusTone(optimisticBooking.status)}
        isJustPlaced={isJustPlaced && !closed}
        steps={BOOKING_STEPS.map((step) => ({
          key: step.key,
          label: step.label,
          description: step.description,
          date: dates[step.key] ?? null,
        }))}
        currentStepIndex={toBookingStepIndex(optimisticBooking.status)}
        isClosed={closed}
        closedLabel={closedLabel}
        facts={facts}
        participants={optimisticBooking.participants}
        pricePerPerson={optimisticBooking.price_per_person}
        discount={optimisticBooking.discount}
        total={optimisticBooking.total}
        note={optimisticBooking.note}
        whatsappUrl={whatsappUrl}
        canCancel={optimisticBooking.can_cancel}
        canReschedule={optimisticBooking.can_reschedule}
        isCancelling={isCancelling}
        onCancel={() => setIsCancelOpen(true)}
        onReschedule={handleOpenMove}
      />
      <CancelBookingDialog
        isOpen={isCancelOpen}
        reason={reason}
        isSubmitting={isCancelling}
        onReasonChange={setReason}
        onOpenChange={setIsCancelOpen}
        onConfirm={() => void handleConfirmCancel()}
      />
      <RescheduleDialog
        isOpen={isMoveOpen}
        monthLabel={formatMonth(month)}
        notice={
          picked.length > 0
            ? `${spanNotice(spanAllowance)}. Days further out are closed off.`
            : null
        }
        weeks={weeks}
        selectedDate={selectedDate}
        canGoBack={month > toMonthKey(todayKey)}
        canGoForward
        slots={slots}
        pickedSlots={pickedSlots}
        slotsNeeded={needed}
        isUnchanged={isUnchangedMove}
        isSubmitting={isRescheduling}
        onOpenChange={setIsMoveOpen}
        onPreviousMonth={() => setMonth(shiftMonth(month, -1))}
        onNextMonth={() => setMonth(shiftMonth(month, 1))}
        onSelectDate={handleSelectDate}
        onToggleSlot={handleToggleSlot}
        onRemoveSlot={handleRemoveSlot}
        onConfirm={() => void handleConfirmMove()}
      />
    </>
  );
}
