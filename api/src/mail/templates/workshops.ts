import type { WorkshopBooking } from "@/features/workshops/workshops.type";
import { type ClosingContext, renderMail } from "./layout";

const inr = (value: number): string => `₹${value.toLocaleString("en-IN")}`;

function slotLines(booking: WorkshopBooking): string[] {
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
  return booking.slots.map(
    (slot) => `${format.format(slot.starts_at)} to ${end.format(slot.ends_at)}`,
  );
}

// A booking can spread over days, so the subject names the first hour only.
function when(booking: WorkshopBooking): string {
  return slotLines(booking)[0] ?? "";
}

function detailLines(booking: WorkshopBooking): string[] {
  return [
    booking.config.name,
    ...slotLines(booking),
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
    // A free session has nothing to pay, so the mail does not promise payment details.
    intro:
      booking.total === 0
        ? "Thanks for booking a session. We will confirm it on WhatsApp within a day."
        : "Thanks for booking a session. We will confirm it on WhatsApp within a day and share how to pay.",
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

function cancelledIntro(
  booking: WorkshopBooking,
  closing: ClosingContext,
): string {
  const reason = booking.cancel_reason
    ? `Your session was cancelled: ${booking.cancel_reason}`
    : "Your session has been cancelled.";
  if (!closing.byStudio) return reason;
  return closing.wasPaid
    ? `${reason} Sorry for the change. You can choose a full refund or another date. Message us on WhatsApp and tell us which you would like.`
    : `${reason} Sorry for the change. If you would like another date, message us on WhatsApp.`;
}

export function bookingStatusMail(
  booking: WorkshopBooking,
  closing: ClosingContext = { byStudio: false, wasPaid: false },
): { subject: string; html: string; text: string } | null {
  const copy: Partial<
    Record<WorkshopBooking["status"], { title: string; intro: string }>
  > = {
    APPROVED: {
      title: "Your session is approved",
      intro:
        booking.total === 0
          ? "We have approved your session and will confirm it shortly."
          : "We have approved your session and will send payment details next. Once payment reaches us it is confirmed.",
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
      intro: cancelledIntro(booking, closing),
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
