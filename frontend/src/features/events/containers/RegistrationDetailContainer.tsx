"use client";

import { useUser } from "@clerk/nextjs";
import { useCallback, useState } from "react";

import { formatDate, formatDateTime, formatInr } from "@/lib/format";

import { CancelRegistrationDialog } from "@/features/events/components/CancelRegistrationDialog";
import { RegistrationDetail } from "@/features/events/components/RegistrationDetail";
import {
  useCancelRegistration,
  useRegistration,
} from "@/features/events/hooks";
import {
  type EventFact,
  isRegistrationClosed,
  REGISTRATION_STEPS,
  toEventPath,
  toEventTypeLabel,
  toRegistrationStatusLabel,
  toRegistrationStatusTone,
  toRegistrationStepIndex,
  toTimeRange,
  toWhatsAppBookingMessage,
} from "@/features/events/types";
import { buildWhatsAppUrl } from "@/features/layout/types";

export interface RegistrationDetailContainerProps {
  registrationId: string;
  isJustPlaced: boolean;
  whatsappNumber: string;
}

export function RegistrationDetailContainer({
  registrationId,
  isJustPlaced,
  whatsappNumber,
}: RegistrationDetailContainerProps) {
  const { registration, isLoading, hasError, refetch } =
    useRegistration(registrationId);
  const { cancel, isCancelling } = useCancelRegistration();
  const { user } = useUser();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleConfirmCancel = useCallback(async () => {
    const done = await cancel(registrationId, reason);
    if (done) setIsCancelOpen(false);
  }, [cancel, reason, registrationId]);

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8"
        aria-busy="true"
      >
        <div className="h-8 w-56 animate-pulse bg-ash" />
        <div className="mt-8 h-64 animate-pulse bg-ash/60" />
      </div>
    );
  }
  if (hasError || !registration) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-16 text-center md:px-8">
        <h1 className="font-heading text-2xl tracking-tight">
          We could not find that booking
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

  const event = registration.event;
  const dates: Record<string, string | null> = {
    PENDING: formatDateTime(registration.created_at),
    APPROVED: registration.approved_at
      ? formatDateTime(registration.approved_at)
      : null,
    CONFIRMED: registration.confirmed_at
      ? formatDateTime(registration.confirmed_at)
      : null,
  };
  const closed = isRegistrationClosed(registration.status);
  const closedOn = registration.cancelled_at ?? registration.rejected_at;
  const closedLabel = closed
    ? `${toRegistrationStatusLabel(registration.status)}${closedOn ? ` on ${formatDateTime(closedOn)}` : ""}${registration.cancel_reason ? ` · ${registration.cancel_reason}` : ""}`
    : null;
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppUrl(
        whatsappNumber,
        toWhatsAppBookingMessage({
          registrationId: registration.id,
          eventTitle: event.title,
          when: `${formatDate(event.starts_at)}, ${toTimeRange(event.starts_at, event.ends_at)}`,
          seats: registration.seats,
          total: formatInr(registration.total),
          guestName: user?.fullName ?? "",
        }),
      )
    : null;

  const facts: EventFact[] = [
    { label: "Kind", value: toEventTypeLabel(event.event_type) },
    { label: "Date", value: formatDate(event.starts_at) },
    { label: "Time", value: toTimeRange(event.starts_at, event.ends_at) },
    { label: "Where", value: `${event.location}, ${event.address}` },
  ];

  return (
    <>
      <RegistrationDetail
        registrationId={registration.id}
        eventTitle={event.title}
        eventHref={toEventPath(event.slug)}
        bookedOn={formatDateTime(registration.created_at)}
        statusLabel={toRegistrationStatusLabel(registration.status)}
        statusTone={toRegistrationStatusTone(registration.status)}
        isJustPlaced={isJustPlaced && !closed}
        steps={REGISTRATION_STEPS.map((step) => ({
          key: step.key,
          label: step.label,
          description: step.description,
          date: dates[step.key] ?? null,
        }))}
        currentStepIndex={toRegistrationStepIndex(registration.status)}
        isClosed={closed}
        closedLabel={closedLabel}
        facts={facts}
        seats={registration.seats}
        unitPrice={registration.unit_price}
        discount={registration.discount}
        total={registration.total}
        note={registration.note}
        whatsappUrl={whatsappUrl}
        canCancel={registration.can_cancel}
        isCancelling={isCancelling}
        onCancel={() => setIsCancelOpen(true)}
      />
      <CancelRegistrationDialog
        isOpen={isCancelOpen}
        reason={reason}
        isSubmitting={isCancelling}
        onReasonChange={setReason}
        onOpenChange={setIsCancelOpen}
        onConfirm={() => void handleConfirmCancel()}
      />
    </>
  );
}
