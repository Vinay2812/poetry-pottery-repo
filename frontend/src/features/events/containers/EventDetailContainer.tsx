"use client";

import { useCallback, useMemo, useState } from "react";

import { formatDate, formatInr } from "@/lib/format";

import { EventDetail } from "@/features/events/components/EventDetail";
import { ReserveBox } from "@/features/events/components/ReserveBox";
import { useRegisterForEvent } from "@/features/events/hooks";
import {
  type EventDetailData,
  type EventFact,
  isRegistrationClosed,
  MAX_SEATS,
  toEventTypeLabel,
  toLevelLabel,
  toRegistrationPath,
  toRegistrationStatusLabel,
  toSeatsLabel,
  toSeatsOfTotalLabel,
  toTimeRange,
} from "@/features/events/types";
import { buildWhatsAppUrl } from "@/features/layout/types";

export interface EventDetailContainerProps {
  event: EventDetailData;
  whatsappNumber: string;
}

const MAX_PARAGRAPHS = 3;

function toParagraphs(description: string): string[] {
  return description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, MAX_PARAGRAPHS);
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

  const facts = useMemo<EventFact[]>(() => {
    const levelLabel = toLevelLabel(event.level);
    const rows: EventFact[] = [
      { label: "Date", value: formatDate(event.starts_at) },
      { label: "Time", value: toTimeRange(event.starts_at, event.ends_at) },
      { label: "Where", value: `${event.location}, ${event.address}` },
    ];
    if (levelLabel) rows.push({ label: "Level", value: levelLabel });
    if (event.instructor)
      rows.push({ label: "Instructor", value: event.instructor });
    if (event.performers.length > 0)
      rows.push({ label: "Line-up", value: event.performers.join(", ") });
    rows.push({ label: "Price", value: `${formatInr(event.price)} a seat` });
    rows.push({
      label: "Seats",
      value: event.is_past
        ? "This one has wrapped up"
        : toSeatsOfTotalLabel(event.available_seats, event.total_seats),
    });
    return rows;
  }, [event]);

  // A cancelled or rejected row still comes back, but the studio lets you book again.
  const registration =
    event.my_registration && !isRegistrationClosed(event.my_registration.status)
      ? event.my_registration
      : null;
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
      facts={facts}
      paragraphs={toParagraphs(event.description)}
      includes={event.includes}
      gallery={event.gallery}
      isPast={event.is_past}
      reserveBox={
        <ReserveBox
          price={event.price}
          seats={seats}
          maxSeats={Math.max(1, Math.min(MAX_SEATS, event.available_seats))}
          note={note}
          seatsLabel={toSeatsLabel(event.available_seats, event.total_seats)}
          isSoldOut={event.available_seats <= 0}
          isPast={event.is_past}
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
