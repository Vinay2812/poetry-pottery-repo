"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback, useOptimistic, useState } from "react";

import { RegistrationStatus } from "@/graphql/generated/graphql";

import { formatDate, formatInr } from "@/lib/format";

import { PageShell } from "@/components/layout/PageShell";

import { SignInWall } from "@/features/auth/components/SignInWall";
import { CancelRegistrationDialog } from "@/features/events/components/CancelRegistrationDialog";
import { RegistrationDetail } from "@/features/events/components/RegistrationDetail";
import { TEXT_LINK } from "@/features/events/components/styles";
import {
  useCancelRegistration,
  useRegistration,
} from "@/features/events/hooks";
import {
  applyRegistrationCancellation,
  isRegistrationClosed,
  isRequestBannerShown,
  REGISTRATION_STAGES,
  toEventPath,
  toRegistrationClosedLabel,
  toRegistrationFacts,
  toRegistrationStatusLabel,
  toRegistrationStatusTone,
  toRegistrationStepDates,
  toTimeRange,
  toWhatsAppBookingMessage,
} from "@/features/events/types";
import { buildWhatsAppUrl } from "@/features/layout/types";
import { toTimelineSteps } from "@/lib/timeline";
import { ReviewActionContainer } from "@/features/reviews";

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
  const { openSignIn } = useClerk();
  const { cancel, isCancelling } = useCancelRegistration({
    patch: (request) =>
      applyCancellation({
        reason: request.reason,
        at: new Date().toISOString(),
      }),
    refresh: refetch,
  });
  const { user } = useUser();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  // The dialog closes and the badge turns at once; a refusal rolls both back with a toast.
  const handleConfirmCancel = useCallback(() => {
    setIsCancelOpen(false);
    cancel(registrationId, reason);
  }, [cancel, reason, registrationId]);

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
          className={TEXT_LINK}
        >
          Try again
        </button>
      </PageShell>
    );
  }

  const event = optimisticRegistration.event;
  const stepDates = toRegistrationStepDates(optimisticRegistration);
  const isClosed = isRegistrationClosed(optimisticRegistration.status);
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
  // Only a seat that was taken at a finished session can carry a review.
  const canReview =
    optimisticRegistration.status === RegistrationStatus.Confirmed &&
    event.is_past;

  return (
    <>
      <RegistrationDetail
        registrationId={optimisticRegistration.id}
        eventTitle={event.title}
        eventHref={toEventPath(event.slug)}
        statusLabel={toRegistrationStatusLabel(optimisticRegistration.status)}
        statusTone={toRegistrationStatusTone(optimisticRegistration.status)}
        isRequestShown={isRequestBannerShown(
          isJustPlaced,
          optimisticRegistration.status,
        )}
        steps={toTimelineSteps({
          stages: REGISTRATION_STAGES,
          status: optimisticRegistration.status,
          dates: stepDates,
          isClosed,
        })}
        closedLabel={toRegistrationClosedLabel(optimisticRegistration)}
        facts={toRegistrationFacts(event)}
        seats={optimisticRegistration.seats}
        unitPrice={optimisticRegistration.unit_price}
        discount={optimisticRegistration.discount}
        total={optimisticRegistration.total}
        note={optimisticRegistration.note}
        whatsappUrl={whatsappUrl}
        canCancel={optimisticRegistration.can_cancel}
        isCancelling={isCancelling}
        reviewAction={
          canReview ? (
            <ReviewActionContainer
              kind="event"
              subjectId={event.id}
              slug={event.slug}
              subjectName={event.title}
            />
          ) : null
        }
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
