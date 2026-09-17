import type { Registration } from "@/features/events/events.type";
import { renderMail } from "./layout";

const inr = (value: number): string => `₹${value.toLocaleString("en-IN")}`;
const when = (date: Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);

function detailLines(registration: Registration): string[] {
  const { event } = registration;
  return [
    event.title,
    when(event.starts_at),
    `${event.location}, ${event.address}`,
    `${registration.seats} ${registration.seats === 1 ? "seat" : "seats"} · ${inr(registration.total)}`,
  ];
}

export function registrationPlacedCustomerMail(registration: Registration): {
  subject: string;
  html: string;
  text: string;
} {
  const body = renderMail({
    title: "Seat request received",
    intro: `Thanks for signing up. We will confirm your place for ${registration.event.title} on WhatsApp within a day and share how to pay.`,
    blocks: [{ heading: "Your booking", lines: detailLines(registration) }],
    cta: {
      label: "View your booking",
      path: `/registrations/${registration.id}`,
    },
  });
  return {
    subject: `Seat request ${registration.id} · ${registration.event.title}`,
    ...body,
  };
}

export function registrationPlacedStudioMail(
  registration: Registration,
  guestName: string,
  guestEmail: string,
): { subject: string; html: string; text: string } {
  const body = renderMail({
    title: `New seat request ${registration.id}`,
    intro: `${guestName} (${guestEmail}) wants ${registration.seats} ${registration.seats === 1 ? "seat" : "seats"} at ${registration.event.title}.`,
    blocks: [
      { heading: "Booking", lines: detailLines(registration) },
      ...(registration.note
        ? [{ heading: "Note from the guest", lines: [registration.note] }]
        : []),
    ],
    cta: {
      label: "Open in admin",
      path: `/dashboard/events/${registration.event.id}`,
    },
  });
  return { subject: `New seat request · ${registration.event.title}`, ...body };
}

export function registrationStatusMail(
  registration: Registration,
): { subject: string; html: string; text: string } | null {
  const copy: Partial<
    Record<Registration["status"], { title: string; intro: string }>
  > = {
    APPROVED: {
      title: "Your seat is held",
      intro: `We have held your seat for ${registration.event.title}. Once payment reaches us it is confirmed.`,
    },
    CONFIRMED: {
      title: "You are confirmed",
      intro: `See you at ${registration.event.title}. Bring clothes you do not mind getting muddy.`,
    },
    REJECTED: {
      title: "We could not fit you in",
      intro: registration.cancel_reason
        ? `Sorry, we could not confirm your seat for ${registration.event.title}: ${registration.cancel_reason}`
        : `Sorry, we could not confirm your seat for ${registration.event.title}.`,
    },
    CANCELLED: {
      title: "Booking cancelled",
      intro: `Your booking ${registration.id} for ${registration.event.title} has been cancelled.`,
    },
  };
  const entry = copy[registration.status];
  if (!entry) return null;
  const body = renderMail({
    title: entry.title,
    intro: entry.intro,
    blocks: [{ heading: "Booking", lines: detailLines(registration) }],
    cta: {
      label: "View your booking",
      path: `/registrations/${registration.id}`,
    },
  });
  return { subject: `${entry.title} · ${registration.event.title}`, ...body };
}
