"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useOptimistic, useState, useTransition } from "react";

import { formatDateTime, formatInr, pluralize } from "@/lib/format";

import { PageShell } from "@/components/layout/PageShell";

import { SignInWall } from "@/features/auth";
import { buildWhatsAppUrl } from "@/features/layout/types";
import { BookingDetail } from "@/features/workshops/components/BookingDetail";
import { CancelBookingDialog } from "@/features/workshops/components/CancelBookingDialog";
import { RescheduleDialog } from "@/features/workshops/components/RescheduleDialog";
import {
  useCancelWorkshopBooking,
  useRescheduleWorkshopBooking,
  useWorkshopBooking,
} from "@/features/workshops/hooks";
import { useSlotPicker } from "@/features/workshops/slot-picker";
import { toClosedLabel, toTimelineSteps } from "@/features/orders/types";
import {
  applyBookingAction,
  BOOKING_STAGES,
  formatDayRange,
  formatHours,
  groupSlotsByDay,
  isBookingClosed,
  isRequestBannerShown,
  type SessionFact,
  toBookingStatusLabel,
  toBookingStatusTone,
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

  const timezone = optimisticBooking?.config.timezone ?? "Asia/Kolkata";
  // The guest's own hours count as free while they move, so they can keep or re-pick them.
  const picker = useSlotPicker({
    workshop: optimisticBooking?.config ?? null,
    hours: optimisticBooking?.hours ?? 1,
    participants: optimisticBooking?.participants ?? 1,
    excludeBookingId: bookingId,
    isSkipped: !isMoveOpen,
  });
  const { isComplete, isUnchanged, picked, startFrom } = picker;

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
    if (!isComplete || isUnchanged) return;
    setIsMoveOpen(false);
    startTransition(async () => {
      applyBookingChange({ kind: "reschedule", slots: picked });
      await reschedule(
        bookingId,
        picked.map((slot) => slot.starts_at),
      );
    });
  }, [
    applyBookingChange,
    bookingId,
    isComplete,
    isUnchanged,
    picked,
    reschedule,
  ]);

  // The picker opens on the hours the guest already has, so a move can keep most of them.
  const handleOpenMove = useCallback(() => {
    if (!optimisticBooking) return;
    startFrom(optimisticBooking.slots);
    setIsMoveOpen(true);
  }, [optimisticBooking, startFrom]);

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
    ? toClosedLabel(
        toBookingStatusLabel(optimisticBooking.status),
        closedOn ? formatDateTime(closedOn) : null,
        optimisticBooking.cancel_reason,
      )
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
    { label: "Hours", value: formatHours(optimisticBooking.hours) },
    {
      label: "People",
      value: pluralize(optimisticBooking.participants, "person", "people"),
    },
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
        dateLabel={formatDayRange(optimisticBooking.slots, timezone)}
        bookedOn={formatDateTime(optimisticBooking.created_at)}
        statusLabel={toBookingStatusLabel(optimisticBooking.status)}
        statusTone={toBookingStatusTone(optimisticBooking.status)}
        isJustPlaced={isRequestBannerShown(
          isJustPlaced,
          optimisticBooking.status,
        )}
        steps={toTimelineSteps({
          stages: BOOKING_STAGES,
          status: optimisticBooking.status,
          dates,
          isClosed: closed,
        })}
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
        isLoading={picker.isLoading}
        hasError={picker.hasError}
        monthLabel={picker.monthLabel}
        notice={picker.notice}
        weeks={picker.weeks}
        selectedDate={picker.selectedDate}
        canGoBack={picker.canGoBack}
        canGoForward={picker.canGoForward}
        slots={picker.slots}
        pickedSlots={picker.pickedSlots}
        progress={picker.progress}
        isComplete={isComplete}
        isSwapHintShown={picker.isSwapHintShown}
        isUnchanged={isUnchanged}
        isSubmitting={isRescheduling}
        onOpenChange={setIsMoveOpen}
        onPreviousMonth={picker.onPreviousMonth}
        onNextMonth={picker.onNextMonth}
        onSelectDate={picker.onSelectDate}
        onToggleSlot={picker.onToggleSlot}
        onRemoveSlot={picker.onRemoveSlot}
        onConfirm={() => void handleConfirmMove()}
        onRetry={picker.refresh}
      />
    </>
  );
}
