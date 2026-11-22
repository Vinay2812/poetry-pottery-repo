"use client";

import { useCallback, useState } from "react";

import { EventStatus } from "@/graphql/generated/graphql";
import { formatDate } from "@/lib/format";

import { EventDetail } from "@/features/events/components/EventDetail";
import { ReserveBox } from "@/features/events/components/ReserveBox";
import { useEventClock, useRegisterForEvent } from "@/features/events/hooks";
import {
  type EventDetailData,
  hasEventStarted,
  isRegistrationClosed,
  isSeatPriceShown,
  MAX_SEATS,
  toEventFacts,
  toEventTypeLabel,
  toEventWhenRangeLabel,
  toGalleryHeading,
  toParagraphs,
  toRegistrationPath,
  toRegistrationStatusLabel,
  toReserveNotePlaceholder,
  toReserveState,
  toSeatPriceNote,
  toSeatsLabel,
} from "@/features/events/types";
import { buildWhatsAppUrl } from "@/features/layout/types";
import { ReviewsPanelContainer } from "@/features/reviews";
import { CancellationPolicy } from "@/features/workshops";

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
  const { reserve, isReserving } = useRegisterForEvent();
  const { now, sync: syncClock } = useEventClock(renderedAt, event.starts_at);

  // Same rule as the box: once the start passes, a click closes it instead of sending a doomed request.
  const handleReserve = useCallback(() => {
    if (hasEventStarted(event.starts_at, new Date())) {
      syncClock();
      return;
    }
    reserve(event.id, seats, note);
  }, [event.id, event.starts_at, note, reserve, seats, syncClock]);

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
          <CancellationPolicy />
        ) : null
      }
      reserveBox={
        <ReserveBox
          state={reserveState}
          eventId={event.id}
          price={event.price}
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
            registration ? toRegistrationStatusLabel(registration.status) : ""
          }
          bookingSeats={registration?.seats ?? 0}
          whatsappUrl={whatsappUrl}
          onSeatsChange={setSeats}
          onNoteChange={setNote}
          onReserve={handleReserve}
        />
      }
    />
  );
}
