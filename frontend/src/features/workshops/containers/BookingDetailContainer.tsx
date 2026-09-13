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
import type { SlotOption } from "@/features/workshops/components/SlotList";
import {
  useAvailability,
  useCancelWorkshopBooking,
  useRescheduleWorkshopBooking,
  useWorkshopBooking,
} from "@/features/workshops/hooks";
import {
  BOOKING_STEPS,
  bookableStarts,
  formatDateKey,
  formatHours,
  formatMonth,
  formatSessionDate,
  formatSlotRange,
  isBookingClosed,
  type SessionFact,
  sessionCapacity,
  shiftMonth,
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
  const [start, setStart] = useState<string | null>(null);

  const configSlug = booking?.config.slug ?? "";
  const timezone = booking?.config.timezone ?? "Asia/Kolkata";
  const slotMinutes = booking?.config.slot_minutes ?? 60;
  const hours = booking?.hours ?? 1;
  const participants = booking?.participants ?? 1;

  const { days } = useAvailability(configSlug, month, !isMoveOpen);
  const dayByKey = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );
  const todayKey = toDateKey(new Date(), timezone);

  const weeks = useMemo<(CalendarDay | null)[][]>(
    () =>
      toMonthGrid(month).map((week) =>
        week.map((dateKey) => {
          if (!dateKey) return null;
          const day = dayByKey.get(dateKey);
          const starts = bookableStarts(day, hours, participants, slotMinutes);
          const wheelsFree = starts.reduce(
            (most, slot) =>
              Math.max(
                most,
                sessionCapacity(
                  day?.slots ?? [],
                  slot.starts_at,
                  hours,
                  slotMinutes,
                ),
              ),
            0,
          );
          return {
            dateKey,
            dayNumber: Number(dateKey.slice(8)),
            dayLabel: formatDateKey(dateKey),
            wheelsFree,
            isClosed: day?.is_closed ?? true,
            isPast: dateKey < todayKey,
          };
        }),
      ),
    [dayByKey, hours, month, participants, slotMinutes, todayKey],
  );

  const selectedDay = selectedDate ? dayByKey.get(selectedDate) : undefined;
  const slots = useMemo<SlotOption[]>(
    () =>
      bookableStarts(selectedDay, hours, participants, slotMinutes).map(
        (slot) => ({
          startsAt: slot.starts_at,
          label: formatSlotRange(
            slot.starts_at,
            new Date(
              new Date(slot.starts_at).getTime() + hours * 3_600_000,
            ).toISOString(),
            timezone,
          ),
          wheelsFree: sessionCapacity(
            selectedDay?.slots ?? [],
            slot.starts_at,
            hours,
            slotMinutes,
          ),
        }),
      ),
    [hours, participants, selectedDay, slotMinutes, timezone],
  );

  const handleConfirmCancel = useCallback(async () => {
    const done = await cancel(bookingId, reason);
    if (done) setIsCancelOpen(false);
  }, [bookingId, cancel, reason]);

  const handleConfirmMove = useCallback(async () => {
    if (!start) return;
    const done = await reschedule(bookingId, start);
    if (done) {
      setIsMoveOpen(false);
      setStart(null);
      setSelectedDate(null);
    }
  }, [bookingId, reschedule, start]);

  const handleOpenMove = useCallback(() => {
    if (booking)
      setMonth(
        toMonthKey(toDateKey(booking.starts_at, booking.config.timezone)),
      );
    setSelectedDate(null);
    setStart(null);
    setIsMoveOpen(true);
  }, [booking]);

  const handleSelectDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
    setStart(null);
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
  const when = `${formatSessionDate(booking.starts_at, timezone)}, ${formatSlotRange(booking.starts_at, booking.ends_at, timezone)}`;
  const facts: SessionFact[] = [
    { label: "Session", value: booking.config.name },
    { label: "Date", value: formatSessionDate(booking.starts_at, timezone) },
    {
      label: "Time",
      value: formatSlotRange(booking.starts_at, booking.ends_at, timezone),
    },
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
        selectedStart={start}
        isSubmitting={isRescheduling}
        onOpenChange={setIsMoveOpen}
        onPreviousMonth={() => setMonth(shiftMonth(month, -1))}
        onNextMonth={() => setMonth(shiftMonth(month, 1))}
        onSelectDate={handleSelectDate}
        onSelectSlot={setStart}
        onConfirm={() => void handleConfirmMove()}
      />
    </>
  );
}
