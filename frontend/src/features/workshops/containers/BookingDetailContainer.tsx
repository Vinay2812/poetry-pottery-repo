"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useMemo, useState } from "react";

import { formatDateTime, formatInr } from "@/lib/format";

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
  BOOKING_STEPS,
  formatDateKey,
  formatHourRange,
  formatHours,
  formatMonth,
  groupSlotsByDay,
  isBookingClosed,
  isDayWithinSpan,
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

  const configSlug = booking?.config.slug ?? "";
  const timezone = booking?.config.timezone ?? "Asia/Kolkata";
  const slotMinutes = booking?.config.slot_minutes ?? 60;
  const spanAllowance = booking?.config.slot_span_days ?? 1;
  const hours = booking?.hours ?? 1;
  const participants = booking?.participants ?? 1;
  const needed = slotsNeeded(hours, slotMinutes);

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

  const handleConfirmCancel = useCallback(async () => {
    const done = await cancel(bookingId, reason);
    if (done) setIsCancelOpen(false);
  }, [bookingId, cancel, reason]);

  const handleConfirmMove = useCallback(async () => {
    if (pickedSlots.length !== needed) return;
    const done = await reschedule(
      bookingId,
      pickedSlots.map((slot) => slot.startsAt),
    );
    if (done) {
      setIsMoveOpen(false);
      setPicked([]);
      setSelectedDate(null);
    }
  }, [bookingId, needed, pickedSlots, reschedule]);

  // The picker opens on the hours the guest already has, so a move can keep most of them.
  const handleOpenMove = useCallback(() => {
    if (!booking) return;
    setMonth(toMonthKey(toDateKey(booking.starts_at, booking.config.timezone)));
    setSelectedDate(toDateKey(booking.starts_at, booking.config.timezone));
    setPicked(
      booking.slots.map((slot) => ({
        starts_at: slot.starts_at as string,
        ends_at: slot.ends_at as string,
      })),
    );
    setIsMoveOpen(true);
  }, [booking]);

  const handleSelectDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
  }, []);

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6"
        aria-busy="true"
      >
        <div className="h-8 w-56 animate-pulse bg-ash" />
        <div className="mt-8 h-64 animate-pulse bg-ash/60" />
      </div>
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
  if (hasError || !booking) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-3 px-4 py-16 md:px-6">
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
      </div>
    );
  }

  const dates: Record<string, string | null> = {
    PENDING: formatDateTime(booking.created_at),
    APPROVED: booking.approved_at ? formatDateTime(booking.approved_at) : null,
    CONFIRMED: booking.confirmed_at
      ? formatDateTime(booking.confirmed_at)
      : null,
  };
  const closed = isBookingClosed(booking.status);
  const closedOn = booking.cancelled_at ?? booking.rejected_at;
  const closedLabel = closed
    ? `${toBookingStatusLabel(booking.status)}${closedOn ? ` on ${formatDateTime(closedOn)}` : ""}${booking.cancel_reason ? ` · ${booking.cancel_reason}` : ""}`
    : null;
  const dayGroups = groupSlotsByDay(booking.slots, timezone);
  const when = dayGroups
    .map((group) => `${group.dayLabel} ${group.timesLabel}`)
    .join("; ");
  const facts: SessionFact[] = [
    { label: "Session", value: booking.config.name },
    ...dayGroups.map((group) => ({
      label: group.dayLabel,
      value: group.timesLabel,
    })),
    { label: "Duration", value: formatHours(booking.hours) },
    {
      label: "You take home",
      value: `${booking.pieces_per_person * booking.participants} pieces, fired and glazed`,
    },
  ];
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppUrl(
        whatsappNumber,
        toWhatsAppSessionMessage({
          bookingId: booking.id,
          when,
          hours: booking.hours,
          participants: booking.participants,
          total: formatInr(booking.total),
          guestName: user?.fullName ?? "",
        }),
      )
    : null;

  return (
    <>
      <BookingDetail
        bookingId={booking.id}
        bookedOn={formatDateTime(booking.created_at)}
        statusLabel={toBookingStatusLabel(booking.status)}
        statusTone={toBookingStatusTone(booking.status)}
        isJustPlaced={isJustPlaced && !closed}
        steps={BOOKING_STEPS.map((step) => ({
          key: step.key,
          label: step.label,
          description: step.description,
          date: dates[step.key] ?? null,
        }))}
        currentStepIndex={toBookingStepIndex(booking.status)}
        isClosed={closed}
        closedLabel={closedLabel}
        facts={facts}
        participants={booking.participants}
        pricePerPerson={booking.price_per_person}
        discount={booking.discount}
        total={booking.total}
        note={booking.note}
        whatsappUrl={whatsappUrl}
        canCancel={booking.can_cancel}
        canReschedule={booking.can_reschedule}
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
        weeks={weeks}
        selectedDate={selectedDate}
        canGoBack={month > toMonthKey(todayKey)}
        canGoForward
        slots={slots}
        pickedSlots={pickedSlots}
        slotsNeeded={needed}
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
