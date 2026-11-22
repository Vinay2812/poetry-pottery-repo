"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useOptimistic, useState, useTransition } from "react";

import { RegistrationStatus } from "@/graphql/generated/graphql";

import { formatInr, pluralize } from "@/lib/format";

import { PageShell } from "@/components/layout/PageShell";

import { SignInWall } from "@/features/auth";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { BookingDetail } from "@/features/workshops/components/BookingDetail";
import { CancelBookingDialog } from "@/features/workshops/components/CancelBookingDialog";
import {
  useCancelWorkshopBooking,
  useWorkshopBooking,
} from "@/features/workshops/hooks";
import { toClosedLabel, toTimelineDate, toTimelineSteps } from "@/lib/timeline";
import {
  isRegistrationClosed,
  isRequestLapsed,
  toRegistrationStatusLabel,
  toRegistrationStatusTone,
  toWithdrawNote,
} from "@/lib/registration-status";
import {
  applyBookingAction,
  formatDayRange,
  formatHours,
  groupSlotsByDay,
  isRequestBannerShown,
  type SessionFact,
  toBookingStages,
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

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  const timezone = optimisticBooking?.config.timezone ?? "Asia/Kolkata";

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

  const dates: Partial<Record<RegistrationStatus, string | null>> = {
    [RegistrationStatus.Pending]: toTimelineDate(optimisticBooking.created_at),
    [RegistrationStatus.Approved]: toTimelineDate(
      optimisticBooking.approved_at,
    ),
    [RegistrationStatus.Confirmed]: toTimelineDate(
      optimisticBooking.confirmed_at,
    ),
  };
  const isFree = optimisticBooking.total === 0;
  const closed = isRegistrationClosed(optimisticBooking.status);
  const closedOn =
    optimisticBooking.cancelled_at ?? optimisticBooking.rejected_at;
  const closedLabel = closed
    ? toClosedLabel(
        toRegistrationStatusLabel(optimisticBooking.status, isFree),
        toTimelineDate(closedOn),
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
  const isLapsed = isRequestLapsed(
    optimisticBooking.status,
    optimisticBooking.starts_at,
  );
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
          isFree,
          isLapsed,
        }),
      )
    : null;

  return (
    <>
      <BookingDetail
        bookingId={optimisticBooking.id}
        dateLabel={formatDayRange(optimisticBooking.slots, timezone)}
        statusLabel={toRegistrationStatusLabel(
          optimisticBooking.status,
          isFree,
        )}
        statusTone={toRegistrationStatusTone(optimisticBooking.status)}
        isJustPlaced={isRequestBannerShown(
          isJustPlaced,
          optimisticBooking.status,
          isLapsed,
        )}
        steps={toTimelineSteps({
          stages: toBookingStages(optimisticBooking.total, isLapsed),
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
        isCancelling={isCancelling}
        onCancel={() => setIsCancelOpen(true)}
      />
      <CancelBookingDialog
        isOpen={isCancelOpen}
        reason={reason}
        isSubmitting={isCancelling}
        withdrawNote={toWithdrawNote(optimisticBooking.total === 0)}
        onReasonChange={setReason}
        onOpenChange={setIsCancelOpen}
        onConfirm={() => void handleConfirmCancel()}
      />
    </>
  );
}
