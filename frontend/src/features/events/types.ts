import {
  type EventCardFragment,
  EventLevel,
  type EventQuery,
  type EventsFilterInput,
  EventType,
  EventWhen,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import { formatTime } from "@/lib/format";

import type { StatusTone } from "@/features/orders/types";

export type EventCardData = EventCardFragment;
export type EventDetailData = EventQuery["event"];

const PAGE_SIZE = 12;
export const MAX_SEATS = 4;
export const SEAT_NOTE =
  "Seats are confirmed by hand on WhatsApp, usually within a day";

export interface EventFact {
  label: string;
  value: string;
}

export function toEventPath(slug: string): string {
  return `/events/${slug}`;
}

export function toRegistrationPath(id: string): string {
  return `/registrations/${id}`;
}

export function toSeatsLabel(available: number, total: number): string {
  if (available <= 0) return "Sold out";
  if (available === 1) return "Last seat";
  if (available >= total) return `All ${total} seats open`;
  return `${available} seats left`;
}

const LEVEL_LABEL: Record<EventLevel, string> = {
  [EventLevel.Beginner]: "Beginner",
  [EventLevel.Intermediate]: "Intermediate",
  [EventLevel.Advanced]: "Advanced",
  [EventLevel.AllLevels]: "All levels",
};

export function toLevelLabel(level: EventLevel | null): string | null {
  return level === null ? null : LEVEL_LABEL[level];
}

const EVENT_TYPE_LABEL: Record<EventType, string> = {
  [EventType.PotteryWorkshop]: "Pottery workshop",
  [EventType.OpenMic]: "Open mic",
};

export function toEventTypeLabel(eventType: EventType): string {
  return EVENT_TYPE_LABEL[eventType];
}

const WHEN_DATE = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});

const WHEN_HOUR = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

// "Thu 17 Sep · 4 pm": one line, no zero minutes, no comma clutter.
export function toEventWhenLabel(startsAt: string | Date): string {
  const date = new Date(startsAt);
  const day = WHEN_DATE.format(date).replace(/,/g, "").replace("Sept", "Sep");
  const time = WHEN_HOUR.format(date).replace(":00", "");
  return `${day} · ${time}`;
}

export function toSeatsOfTotalLabel(available: number, total: number): string {
  if (available <= 0) return "Sold out";
  return `${available} of ${total} seats left`;
}

export function toTimeRange(
  startsAt: string | Date,
  endsAt: string | Date,
): string {
  return `${formatTime(startsAt)} – ${formatTime(endsAt)}`;
}

export interface RegistrationStep {
  key: RegistrationStatus;
  label: string;
  description: string;
}

export const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    key: RegistrationStatus.Pending,
    label: "Requested",
    description: "We have your request and will hold a seat if one is free.",
  },
  {
    key: RegistrationStatus.Approved,
    label: "Seat held",
    description: "Your seat is held. We share payment details on WhatsApp.",
  },
  {
    key: RegistrationStatus.Confirmed,
    label: "Confirmed",
    description: "Paid and confirmed. Come in ten minutes early.",
  },
];

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: "Awaiting approval",
  [RegistrationStatus.Approved]: "Seat held, awaiting payment",
  [RegistrationStatus.Confirmed]: "Confirmed",
  [RegistrationStatus.Rejected]: "Not approved",
  [RegistrationStatus.Cancelled]: "Cancelled",
};

export function toRegistrationStatusLabel(status: RegistrationStatus): string {
  return STATUS_LABEL[status];
}

export function toRegistrationStatusTone(
  status: RegistrationStatus,
): StatusTone {
  if (
    status === RegistrationStatus.Cancelled ||
    status === RegistrationStatus.Rejected
  )
    return "off";
  if (status === RegistrationStatus.Confirmed) return "done";
  if (status === RegistrationStatus.Pending) return "pending";
  return "active";
}

// Index of the current step. Cancelled and rejected bookings are not steps of their own,
// so they freeze at the last step that actually carries a date.
export function toRegistrationStepIndex(
  status: RegistrationStatus,
  stepDates: Record<string, string | null> = {},
): number {
  const index = REGISTRATION_STEPS.findIndex((step) => step.key === status);
  if (index !== -1) return index;
  return REGISTRATION_STEPS.reduce(
    (reached, step, at) => (stepDates[step.key] ? at : reached),
    0,
  );
}

export function isRegistrationClosed(status: RegistrationStatus): boolean {
  return (
    status === RegistrationStatus.Cancelled ||
    status === RegistrationStatus.Rejected
  );
}

export interface WhatsAppBookingInput {
  registrationId: string;
  eventTitle: string;
  when: string;
  seats: number;
  total: string;
  guestName: string;
}

export function toWhatsAppBookingMessage(input: WhatsAppBookingInput): string {
  return [
    `Hi! I booked ${input.eventTitle} on Poetry & Pottery.`,
    `Booking: ${input.registrationId}`,
    `When: ${input.when}`,
    `Seats: ${input.seats}`,
    `Total: ${input.total}`,
    `Name: ${input.guestName}`,
    "Could you confirm my seat and share payment details?",
  ].join("\n");
}

export interface EventFilters {
  when: EventWhen;
  eventType: EventType | null;
  level: EventLevel | null;
}

export const DEFAULT_EVENT_FILTERS: EventFilters = {
  when: EventWhen.Upcoming,
  eventType: null,
  level: null,
};

const TYPE_VALUES = new Set<string>(Object.values(EventType));
const LEVEL_VALUES = new Set<string>(Object.values(EventLevel));

export function parseEventFilters(params: URLSearchParams): EventFilters {
  const eventType = params.get("type");
  const level = params.get("level");
  const isWorkshop = eventType === EventType.PotteryWorkshop;
  return {
    when: params.get("when") === "past" ? EventWhen.Past : EventWhen.Upcoming,
    eventType:
      eventType && TYPE_VALUES.has(eventType) ? (eventType as EventType) : null,
    level:
      isWorkshop && level && LEVEL_VALUES.has(level)
        ? (level as EventLevel)
        : null,
  };
}

export function toEventSearchParams(filters: EventFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.when === EventWhen.Past) params.set("when", "past");
  if (filters.eventType) params.set("type", filters.eventType);
  if (filters.level) params.set("level", filters.level);
  return params;
}

export function toEventsFilterInput(
  filters: EventFilters,
  page: number,
): EventsFilterInput {
  return {
    when: filters.when,
    event_type: filters.eventType,
    level: filters.level,
    page,
    limit: PAGE_SIZE,
  };
}
