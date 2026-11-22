"use client";

import { useCallback, useRef, useState } from "react";

import { EventStatus } from "@/graphql/generated/graphql";
import { CancellationPolicy } from "@/components/legal/CancellationPolicy";
import { TermsAgreement } from "@/components/legal/TermsAgreement";
import { formatDate } from "@/lib/format";
import { toTermsError } from "@/lib/terms";
import {
  isRegistrationClosed,
  toRegistrationStatusLabel,
} from "@/lib/registration-status";

import { EventDetail } from "@/features/events/components/EventDetail";
import { ReserveBox } from "@/features/events/components/ReserveBox";
import { useEventClock, useRegisterForEvent } from "@/features/events/hooks";
import {
  type EventDetailData,
  hasEventStarted,
  isSeatPriceShown,
  MAX_SEATS,
  toEventFacts,
  toEventTypeLabel,
  toEventWhenRangeLabel,
  toGalleryHeading,
  toParagraphs,
  toRegistrationPath,
  toReserveNotePlaceholder,
  toReserveState,
  toSeatPriceNote,
  toSeatPolicy,
  toSeatsLabel,
} from "@/features/events/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { ReviewsPanelContainer } from "@/features/reviews";

export interface EventDetailContainerProps {
  event: EventDetailData;
  whatsappNumber: string;
  // ISO time the server rendered at, so the first client render agrees with it.
  now: string;
}

export function EventDetailContainer({
  event,
  whatsappNumber,
  now: renderedAt,
}: EventDetailContainerProps) {
  const [seats, setSeats] = useState(1);
  const [note, setNote] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [hasTriedReserving, setHasTriedReserving] = useState(false);
  const termsRef = useRef<HTMLButtonElement>(null);
  const { reserve, isReserving } = useRegisterForEvent();
  const { now, sync: syncClock } = useEventClock(renderedAt, event.starts_at);

  // Same rule as the box: once the start passes, a click closes it instead of sending a doomed request.
  const handleReserve = useCallback(() => {
    if (hasEventStarted(event.starts_at, new Date())) {
      syncClock();
      return;
    }
    if (!isTermsAccepted) {
      setHasTriedReserving(true);
      termsRef.current?.focus();
      return;
    }
    reserve({
      eventId: event.id,
      seats,
      note,
      acceptedTerms: isTermsAccepted,
    });
  }, [
    event.id,
    event.starts_at,
    isTermsAccepted,
    note,
    reserve,
    seats,
    syncClock,
  ]);

  // A cancelled or rejected row still comes back, but the studio lets you book again.
  const registration =
    event.my_registration && !isRegistrationClosed(event.my_registration.status)
      ? event.my_registration
      : null;
  const isCancelled = event.status === EventStatus.Cancelled;
  const hasStarted = hasEventStarted(event.starts_at, now);
  const reserveState = toReserveState({
    isCancelled,
    hasBooking: registration !== null,
    isPast: event.is_past,
    hasStarted,
    availableSeats: event.available_seats,
  });
  // Photos are a record of the day, so they wait until it has happened.
  const gallery = event.is_past ? event.gallery : [];
  const whatsappUrl = whatsappNumber
    ? buildWhatsAppUrl(
        whatsappNumber,
        `Hi! I would like a seat at ${event.title} on ${formatDate(event.starts_at)}.`,
      )
    : null;

  return (
    <EventDetail
      title={event.title}
      imageUrl={event.image_url}
      typeLabel={toEventTypeLabel(event.event_type)}
      whenLabel={toEventWhenRangeLabel(event.starts_at, event.ends_at, now)}
      facts={toEventFacts(event)}
      paragraphs={toParagraphs(event.description)}
      includes={event.includes}
      highlights={event.highlights}
      gallery={gallery}
      galleryHeading={toGalleryHeading(event.event_type)}
      // Only people who sat through a finished date can review it.
      reviews={
        event.is_past && !isCancelled ? (
          <ReviewsPanelContainer
            kind="event"
            subjectId={event.id}
            slug={event.slug}
            subjectName={event.title}
          />
        ) : null
      }
      // The policy is about seats on a date still to come; a date marked done early counts as done.
      policy={
        !hasStarted && !event.is_past && !isCancelled ? (
          <CancellationPolicy points={toSeatPolicy(event.price === 0)} />
        ) : null
      }
      reserveBox={
        <ReserveBox
          state={reserveState}
          eventId={event.id}
          // A booking keeps the price it was made at; the date's current price is for new seats.
          price={registration?.unit_price ?? event.price}
          seats={seats}
          maxSeats={Math.max(1, Math.min(MAX_SEATS, event.available_seats))}
          note={note}
          notePlaceholder={toReserveNotePlaceholder(event.event_type)}
          seatsLabel={toSeatsLabel(event.available_seats, event.total_seats)}
          seatPriceNote={toSeatPriceNote(event.event_type, event.includes)}
          isPriceShown={isSeatPriceShown({
            state: reserveState,
            isPast: event.is_past,
            hasStarted,
            bookingStatus: registration?.status ?? null,
          })}
          hasGallery={gallery.length > 0}
          isReserving={isReserving}
          bookingHref={
            registration ? toRegistrationPath(registration.id) : null
          }
          bookingStatusLabel={
            registration
              ? toRegistrationStatusLabel(
                  registration.status,
                  registration.total === 0,
                )
              : ""
          }
          bookingSeats={registration?.seats ?? 0}
          bookingTotal={registration?.total ?? 0}
          whatsappUrl={whatsappUrl}
          terms={
            <TermsAgreement
              ref={termsRef}
              id="reserve-terms"
              isChecked={isTermsAccepted}
              error={toTermsError(isTermsAccepted, hasTriedReserving)}
              // A free seat has nothing to pay, so nothing to keep final.
              hasPaymentNote={event.price > 0}
              onCheckedChange={setIsTermsAccepted}
            />
          }
          onSeatsChange={setSeats}
          onNoteChange={setNote}
          onReserve={handleReserve}
        />
      }
    />
  );
}
