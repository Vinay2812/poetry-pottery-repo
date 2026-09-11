"use client";

import { useCallback, useState } from "react";

import { formatDate } from "@/lib/format";

import { EventDetail } from "@/features/events/components/EventDetail";
import { ReserveBox } from "@/features/events/components/ReserveBox";
import { useRegisterForEvent } from "@/features/events/hooks";
import {
  type EventDetailData,
  isLowSeats,
  MAX_SEATS,
  toEventTypeLabel,
  toLevelLabel,
  toRegistrationPath,
  toRegistrationStatusLabel,
  toRegistrationStatusTone,
  toSeatsLabel,
  toTimeRange,
} from "@/features/events/types";
import { buildWhatsAppUrl } from "@/features/layout/types";

export interface EventDetailContainerProps {
  event: EventDetailData;
  whatsappNumber: string;
}

export function EventDetailContainer({
  event,
  whatsappNumber,
}: EventDetailContainerProps) {
  const [seats, setSeats] = useState(1);
  const [note, setNote] = useState("");
  const { reserve, isReserving } = useRegisterForEvent();

  const handleReserve = useCallback(() => {
    reserve(event.id, seats, note);
  }, [event.id, note, reserve, seats]);

  const registration = event.my_registration;
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
      levelLabel={toLevelLabel(event.level)}
      dateLabel={formatDate(event.starts_at)}
      timeRange={toTimeRange(event.starts_at, event.ends_at)}
      location={event.location}
      address={event.address}
      ratingAvg={event.rating_avg}
      ratingCount={event.rating_count}
      description={event.description}
      includes={event.includes}
      highlights={event.highlights}
      instructor={event.instructor}
      performers={event.performers}
      gallery={event.gallery}
      isPast={event.is_past}
      reserveBox={
        <ReserveBox
          price={event.price}
          seats={seats}
          maxSeats={Math.max(1, Math.min(MAX_SEATS, event.available_seats))}
          note={note}
          seatsLabel={toSeatsLabel(event.available_seats, event.total_seats)}
          isSeatsLow={isLowSeats(event.available_seats)}
          isSoldOut={event.available_seats <= 0}
          isPast={event.is_past}
          isReserving={isReserving}
          bookingHref={
            registration ? toRegistrationPath(registration.id) : null
          }
          bookingStatusLabel={
            registration ? toRegistrationStatusLabel(registration.status) : ""
          }
          bookingStatusTone={
            registration
              ? toRegistrationStatusTone(registration.status)
              : "pending"
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
