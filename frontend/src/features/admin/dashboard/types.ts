import {
  AdminAgendaKind,
  EventType,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import { toRegistrationStatusLabel } from "@/lib/registration-status";

import { toWheelSessionsHref } from "@/features/admin/workshops/types";

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/** "3 hours · 2 people" reads faster in a row than two columns would. */
export function describeBooking(hours: number, participants: number): string {
  const hourLabel = hours === 1 ? "1 hour" : `${hours} hours`;
  const peopleLabel =
    participants === 1 ? "1 person" : `${participants} people`;
  return `${hourLabel} · ${peopleLabel}`;
}

export function describeItems(count: number): string {
  return count === 1 ? "1 piece" : `${count} pieces`;
}

/** Under three left is worth a nudge; the storefront says the same thing to shoppers. */
export function stockTone(stock: number): "warn" | "quiet" {
  return stock <= 3 ? "warn" : "quiet";
}

export function describeStock(stock: number): string {
  if (stock === 0) return "Sold out";
  return stock === 1 ? "1 left" : `${stock} left`;
}

export function clampDelta(value: number, stock: number): number {
  return Math.max(value, -stock);
}

// Where each thing on today's agenda is handled in the console.
export function toAgendaHref(kind: AdminAgendaKind, id: string): string {
  switch (kind) {
    // The wheel list searches booking ids, so the row opens on just that booking.
    case AdminAgendaKind.Booking:
      return toWheelSessionsHref({ search: id });
    case AdminAgendaKind.Visit:
      return "/dashboard/visits";
    case AdminAgendaKind.Event:
      return `/dashboard/events/${id}`;
  }
}

// Short enough for the agenda's tag column; an event without a type reads plain "Event".
const AGENDA_EVENT_LABEL: Record<EventType, string> = {
  [EventType.PotteryWorkshop]: "Workshop",
  [EventType.OpenMic]: "Open mic",
};

export function toAgendaKindLabel(
  kind: AdminAgendaKind,
  eventType: EventType | null,
): string {
  switch (kind) {
    case AdminAgendaKind.Booking:
      return "Wheel";
    case AdminAgendaKind.Visit:
      return "Visit";
    case AdminAgendaKind.Event:
      return eventType ? AGENDA_EVENT_LABEL[eventType] : "Event";
  }
}

// The request tiles open their lists already narrowed to what is waiting on the studio.
export const WAITING_SESSIONS_HREF = toWheelSessionsHref({
  status: RegistrationStatus.Pending,
});
export const WAITING_EVENT_REQUESTS_HREF = "/dashboard/events?awaiting=1";

// A wheel session ends with its status in the words the guest sees, e.g. "· Awaiting approval".
export function toAgendaDetail(
  detail: string,
  bookingStatus: RegistrationStatus | null,
  isFree: boolean,
): string {
  if (!bookingStatus) return detail;
  return `${detail} · ${toRegistrationStatusLabel(bookingStatus, isFree)}`;
}
