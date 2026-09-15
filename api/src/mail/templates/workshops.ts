import type { WorkshopBooking } from "@/features/workshops/workshops.type";
import { renderMail } from "./layout";

const inr = (value: number): string => `₹${value.toLocaleString("en-IN")}`;

function when(booking: WorkshopBooking): string {
  const format = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: booking.config.timezone,
  });
  const end = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: booking.config.timezone,
  });
  return `${format.format(booking.starts_at)} to ${end.format(booking.ends_at)}`;
}

function detailLines(booking: WorkshopBooking): string[] {
  return [
    booking.config.name,
    when(booking),
    `${booking.participants} ${booking.participants === 1 ? "person" : "people"} · ${booking.hours} ${booking.hours === 1 ? "hour" : "hours"} · ${booking.pieces_per_person} ${booking.pieces_per_person === 1 ? "piece" : "pieces"} each`,
    `Total ${inr(booking.total)}`,
  ];
}

export function bookingPlacedCustomerMail(booking: WorkshopBooking): {
  subject: string;
  html: string;
  text: string;
} {
  const body = renderMail({
    title: "Wheel session requested",
    intro:
      "Thanks for booking a session. We will confirm it on WhatsApp within a day and share how to pay.",
    blocks: [{ heading: "Your session", lines: detailLines(booking) }],
    cta: {
      label: "View your booking",
      path: `/workshops/bookings/${booking.id}`,
    },
  });
  return { subject: `Session request ${booking.id}`, ...body };
}

export function bookingPlacedStudioMail(
  booking: WorkshopBooking,
  guestName: string,
  guestEmail: string,
): { subject: string; html: string; text: string } {
  const body = renderMail({
    title: `New session request ${booking.id}`,
    intro: `${guestName} (${guestEmail}) wants a wheel session.`,
    blocks: [
      { heading: "Session", lines: detailLines(booking) },
      ...(booking.note
        ? [{ heading: "Note from the guest", lines: [booking.note] }]
        : []),
    ],
    cta: { label: "Open in admin", path: "/dashboard/workshops" },
  });
  return { subject: `New wheel session · ${when(booking)}`, ...body };
}

export function bookingStatusMail(
  booking: WorkshopBooking,
  kind: "status" | "rescheduled",
): { subject: string; html: string; text: string } | null {
  if (kind === "rescheduled") {
    const body = renderMail({
      title: "Session moved",
      intro: `Your wheel session is now on ${when(booking)}. Everything else stays the same.`,
      blocks: [{ heading: "Session", lines: detailLines(booking) }],
      cta: {
        label: "View your booking",
        path: `/workshops/bookings/${booking.id}`,
      },
    });
    return { subject: `Session moved · ${booking.id}`, ...body };
  }
  const copy: Partial<
    Record<WorkshopBooking["status"], { title: string; intro: string }>
  > = {
    APPROVED: {
      title: "Your wheel is held",
      intro:
        "We have held your session. Once payment reaches us it is confirmed.",
    },
    CONFIRMED: {
      title: "You are confirmed",
      intro:
        "See you at the studio. Wear something you do not mind getting muddy.",
    },
    REJECTED: {
      title: "We could not fit you in",
      intro: booking.cancel_reason
        ? `Sorry, we could not confirm this session: ${booking.cancel_reason}`
        : "Sorry, we could not confirm this session.",
    },
    CANCELLED: {
      title: "Session cancelled",
      intro: booking.cancel_reason
        ? `Your session was cancelled: ${booking.cancel_reason}`
        : "Your session has been cancelled.",
    },
  };
  const entry = copy[booking.status];
  if (!entry) return null;
  const body = renderMail({
    title: entry.title,
    intro: entry.intro,
    blocks: [{ heading: "Session", lines: detailLines(booking) }],
    cta: {
      label: "View your booking",
      path: `/workshops/bookings/${booking.id}`,
    },
  });
  return { subject: `${entry.title} · ${booking.id}`, ...body };
}
