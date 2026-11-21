import {
  type EventCardFragment,
  EventLevel,
  type EventQuery,
  type EventsFilterInput,
  EventType,
  type RegistrationFieldsFragment,
  EventWhen,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import type { UrlCodec } from "@/lib/use-url-state";

import type { StatusTone } from "@/features/orders/types";

export type EventCardData = EventCardFragment;
export type EventDetailData = EventQuery["event"];

const PAGE_SIZE = 12;
export const MAX_SEATS = 4;
export const SEAT_NOTE =
  "We confirm every seat by hand on WhatsApp, usually within a day.";

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

const WHEN_YEAR = new Intl.DateTimeFormat("en-IN", {
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const WHEN_HOUR = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

function toHourLabel(date: Date): string {
  return WHEN_HOUR.format(date).replace(":00", "");
}

// "Thu 17 Sep · 4 pm": one line, no zero minutes, no comma clutter. Other years say which.
export function toEventWhenLabel(
  startsAt: string | Date,
  now: Date = new Date(),
): string {
  const date = new Date(startsAt);
  const day = WHEN_DATE.format(date).replace(/,/g, "").replace("Sept", "Sep");
  const year = WHEN_YEAR.format(date);
  const dayLabel = year === WHEN_YEAR.format(now) ? day : `${day} ${year}`;
  return `${dayLabel} · ${toHourLabel(date)}`;
}

// "Sun 6 Dec · 4 pm – 7 pm": the line under an event's title.
export function toEventWhenRangeLabel(
  startsAt: string | Date,
  endsAt: string | Date,
  now: Date = new Date(),
): string {
  return `${toEventWhenLabel(startsAt, now)} – ${toHourLabel(new Date(endsAt))}`;
}

export function toTimeRange(
  startsAt: string | Date,
  endsAt: string | Date,
): string {
  return `${formatTime(startsAt)} – ${formatTime(endsAt)}`;
}

const MAX_PARAGRAPHS = 3;

export function toParagraphs(description: string): string[] {
  return description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .slice(0, MAX_PARAGRAPHS);
}

type EventFactsInput = Pick<
  EventDetailData,
  | "starts_at"
  | "ends_at"
  | "location"
  | "address"
  | "level"
  | "instructor"
  | "performers"
>;

// Date, place and who leads it. Price and seats live in the reserve box only.
export function toEventFacts(event: EventFactsInput): EventFact[] {
  const levelLabel = toLevelLabel(event.level);
  return [
    { label: "Date", value: formatDate(event.starts_at) },
    { label: "Time", value: toTimeRange(event.starts_at, event.ends_at) },
    { label: "Where", value: `${event.location}, ${event.address}` },
    ...(levelLabel ? [{ label: "Level", value: levelLabel }] : []),
    ...(event.instructor
      ? [{ label: "Instructor", value: event.instructor }]
      : []),
    ...(event.performers.length > 0
      ? [{ label: "Line-up", value: event.performers.join(", ") }]
      : []),
  ];
}

// The API stops taking seats at the start time, so the page closes the box at the same moment.
export function hasEventStarted(
  startsAt: string | Date,
  now: Date = new Date(),
): boolean {
  return now.getTime() >= new Date(startsAt).getTime();
}

export type ReserveState =
  "cancelled" | "booked" | "past" | "started" | "soldOut" | "open";

interface ReserveStateInput {
  isCancelled: boolean;
  hasBooking: boolean;
  isPast: boolean;
  hasStarted: boolean;
  availableSeats: number;
}

// A booking outranks the date: a past evening still links to the seat you had.
export function toReserveState(input: ReserveStateInput): ReserveState {
  if (input.isCancelled) return "cancelled";
  if (input.hasBooking) return "booked";
  if (input.isPast) return "past";
  if (input.hasStarted) return "started";
  if (input.availableSeats <= 0) return "soldOut";
  return "open";
}

export function toRequestSeatsLabel(seats: number): string {
  return seats === 1 ? "Request a seat" : `Request ${seats} seats`;
}

const SEAT_PRICE_NOTE: Record<EventType, string | null> = {
  [EventType.PotteryWorkshop]:
    "Clay, tools and firing are part of the seat price.",
  [EventType.OpenMic]: null,
};

export function toSeatPriceNote(eventType: EventType): string | null {
  return SEAT_PRICE_NOTE[eventType];
}

const NOTE_PLACEHOLDER: Record<EventType, string> = {
  [EventType.PotteryWorkshop]:
    "Left-handed, coming with a friend, first time on the wheel…",
  [EventType.OpenMic]: "Hoping to read, coming with a friend, need a chair…",
};

export function toReserveNotePlaceholder(eventType: EventType): string {
  return NOTE_PLACEHOLDER[eventType];
}

const GALLERY_HEADING: Record<EventType, string> = {
  [EventType.PotteryWorkshop]: "From the workshop",
  [EventType.OpenMic]: "From the evening",
};

export function toGalleryHeading(eventType: EventType): string {
  return GALLERY_HEADING[eventType];
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

// Same words as wheel sessions: a seat is a request until the studio confirms it.
const STATUS_LABEL: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: "Awaiting confirmation",
  [RegistrationStatus.Approved]: "Seat held, awaiting payment",
  [RegistrationStatus.Confirmed]: "Confirmed",
  [RegistrationStatus.Rejected]: "Not confirmed",
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

export type RegistrationStepDates = Partial<
  Record<RegistrationStatus, string | null>
>;

type StepDatesInput = Pick<
  RegistrationData,
  "created_at" | "approved_at" | "confirmed_at"
>;

export function toRegistrationStepDates(
  registration: StepDatesInput,
): RegistrationStepDates {
  return {
    [RegistrationStatus.Pending]: formatDateTime(registration.created_at),
    [RegistrationStatus.Approved]: registration.approved_at
      ? formatDateTime(registration.approved_at)
      : null,
    [RegistrationStatus.Confirmed]: registration.confirmed_at
      ? formatDateTime(registration.confirmed_at)
      : null,
  };
}

// Index of the current step. Cancelled and rejected bookings are not steps of their own,
// so they freeze at the last step that actually carries a date.
export function toRegistrationStepIndex(
  status: RegistrationStatus,
  stepDates: RegistrationStepDates = {},
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

type ClosedLabelInput = Pick<
  RegistrationData,
  "status" | "cancelled_at" | "rejected_at" | "cancel_reason"
>;

// "Cancelled on 12 Sept, 2026, 2:30 pm · Away that week", or null while the booking is open.
export function toRegistrationClosedLabel(
  registration: ClosedLabelInput,
): string | null {
  if (!isRegistrationClosed(registration.status)) return null;
  const closedOn = registration.cancelled_at ?? registration.rejected_at;
  return [
    toRegistrationStatusLabel(registration.status) +
      (closedOn ? ` on ${formatDateTime(closedOn)}` : ""),
    registration.cancel_reason,
  ]
    .filter(Boolean)
    .join(" · ");
}

type RegistrationFactsInput = Pick<
  RegistrationData["event"],
  "event_type" | "starts_at" | "ends_at" | "location" | "address"
>;

export function toRegistrationFacts(
  event: RegistrationFactsInput,
): EventFact[] {
  return [
    { label: "Kind", value: toEventTypeLabel(event.event_type) },
    { label: "Date", value: formatDate(event.starts_at) },
    { label: "Time", value: toTimeRange(event.starts_at, event.ends_at) },
    { label: "Where", value: `${event.location}, ${event.address}` },
  ];
}

export type RegistrationGroup = "upcoming" | "past";

// Like wheel sessions: a date that has run, or a seat that will never be taken, sits under Past.
export function toRegistrationGroup(
  registration: Pick<RegistrationData, "status"> & {
    event: Pick<RegistrationData["event"], "is_past">;
  },
): RegistrationGroup {
  if (isRegistrationClosed(registration.status)) return "past";
  return registration.event.is_past ? "past" : "upcoming";
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

export const EVENT_FILTERS_CODEC: UrlCodec<
  EventFilters,
  Partial<EventFilters>
> = {
  parse: parseEventFilters,
  serialize: (filters) => toEventSearchParams(filters).toString(),
  apply: (filters, patch) => ({ ...filters, ...patch }),
};

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

// The server and the browser both derive this from the URL, so equal keys mean the same first page.
export function toEventsFilterKey(input: EventsFilterInput): string {
  return JSON.stringify(input);
}

export type RegistrationData = RegistrationFieldsFragment;

export interface RegistrationCancellation {
  reason: string;
  at: string;
}

// The reducer behind the optimistic booking: what the studio will say once it accepts.
export function applyRegistrationCancellation(
  registration: RegistrationData | null,
  cancellation: RegistrationCancellation,
): RegistrationData | null {
  if (!registration) return registration;
  return {
    ...registration,
    status: RegistrationStatus.Cancelled,
    can_cancel: false,
    cancelled_at: cancellation.at,
    cancel_reason: cancellation.reason.trim() || registration.cancel_reason,
  };
}
