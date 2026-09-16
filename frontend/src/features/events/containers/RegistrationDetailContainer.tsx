"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useOptimistic, useState, useTransition } from "react";

import { formatDate, formatDateTime, formatInr } from "@/lib/format";

import { PageShell } from "@/components/layout/PageShell";

import { SignInWall } from "@/features/auth/components/SignInWall";
import { CancelRegistrationDialog } from "@/features/events/components/CancelRegistrationDialog";
import { RegistrationDetail } from "@/features/events/components/RegistrationDetail";
import {
  useCancelRegistration,
  useRegistration,
} from "@/features/events/hooks";
import {
  applyRegistrationCancellation,
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
  const { registration, isLoading, hasError, isSignedIn, refetch } =
    useRegistration(registrationId);
  const [optimisticRegistration, applyCancellation] = useOptimistic(
    registration,
    applyRegistrationCancellation,
  );
  const [, startTransition] = useTransition();
  const { openSignIn } = useClerk();
  const { cancel, isCancelling } = useCancelRegistration();
  const { user } = useUser();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  // The dialog closes and the badge turns at once; a refusal rolls both back with a toast.
  const handleConfirmCancel = useCallback(() => {
    setIsCancelOpen(false);
    startTransition(async () => {
      applyCancellation({ reason, at: new Date().toISOString() });
      await cancel(registrationId, reason);
    });
  }, [applyCancellation, cancel, reason, registrationId]);

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
        message="Sign in to see this booking"
        onSignIn={() => openSignIn()}
      />
    );
  }
  if (hasError || !optimisticRegistration) {
    return (
      <PageShell
        column="wide"
        className="flex flex-col items-center gap-3 py-16 text-center"
      >
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
      </PageShell>
    );
  }

  const event = optimisticRegistration.event;
  const dates: Record<string, string | null> = {
    PENDING: formatDateTime(optimisticRegistration.created_at),
    APPROVED: optimisticRegistration.approved_at
      ? formatDateTime(optimisticRegistration.approved_at)
      : null,
    CONFIRMED: optimisticRegistration.confirmed_at
      ? formatDateTime(optimisticRegistration.confirmed_at)
      : null,
  };
  const closed = isRegistrationClosed(optimisticRegistration.status);
  const closedOn =
    optimisticRegistration.cancelled_at ?? optimisticRegistration.rejected_at;
  const closedLabel = closed
    ? `${toRegistrationStatusLabel(optimisticRegistration.status)}${closedOn ? ` on ${formatDateTime(closedOn)}` : ""}${optimisticRegistration.cancel_reason ? ` · ${optimisticRegistration.cancel_reason}` : ""}`
    : null;
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppUrl(
        whatsappNumber,
        toWhatsAppBookingMessage({
          registrationId: optimisticRegistration.id,
          eventTitle: event.title,
          when: `${formatDate(event.starts_at)}, ${toTimeRange(event.starts_at, event.ends_at)}`,
          seats: optimisticRegistration.seats,
          total: formatInr(optimisticRegistration.total),
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
        registrationId={optimisticRegistration.id}
        eventTitle={event.title}
        eventHref={toEventPath(event.slug)}
        bookedOn={formatDateTime(optimisticRegistration.created_at)}
        statusLabel={toRegistrationStatusLabel(optimisticRegistration.status)}
        statusTone={toRegistrationStatusTone(optimisticRegistration.status)}
        isJustPlaced={isJustPlaced && !closed}
        steps={REGISTRATION_STEPS.map((step) => ({
          key: step.key,
          label: step.label,
          description: step.description,
          date: dates[step.key] ?? null,
        }))}
        currentStepIndex={toRegistrationStepIndex(
          optimisticRegistration.status,
          dates,
        )}
        isClosed={closed}
        closedLabel={closedLabel}
        facts={facts}
        seats={optimisticRegistration.seats}
        unitPrice={optimisticRegistration.unit_price}
        discount={optimisticRegistration.discount}
        total={optimisticRegistration.total}
        note={optimisticRegistration.note}
        whatsappUrl={whatsappUrl}
        canCancel={optimisticRegistration.can_cancel}
        isCancelling={isCancelling}
        onCancel={() => setIsCancelOpen(true)}
      />
      <CancelRegistrationDialog
        isOpen={isCancelOpen}
        reason={reason}
        isSubmitting={isCancelling}
        onReasonChange={setReason}
        onOpenChange={setIsCancelOpen}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
}
