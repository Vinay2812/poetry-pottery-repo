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

import type { PolicyPoint } from "@/components/legal/CancellationPolicy";
import { formatDate, formatShortDay, formatTime } from "@/lib/format";
import type { UrlCodec } from "@/lib/use-url-state";

import {
  type TimelineStage,
  toClosedLabel,
  toTimelineDate,
} from "@/lib/timeline";
import {
  isRegistrationClosed,
  toRegistrationStatusLabel,
  toRequestStages,
  withRequestedLine,
} from "@/lib/registration-status";

export type EventCardData = EventCardFragment;
export type EventDetailData = EventQuery["event"];

const PAGE_SIZE = 12;
export const MAX_SEATS = 4;
export const SEAT_NOTE =
  "We approve each request by hand on WhatsApp, usually within a day.";

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
  const day = formatShortDay(date, "Asia/Kolkata");
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
  "location" | "address" | "level" | "instructor" | "performers"
>;

// Place and who leads it. The date sits under the title; price and seats live in the reserve box.
export function toEventFacts(event: EventFactsInput): EventFact[] {
  const levelLabel = toLevelLabel(event.level);
  return [
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

// The one start-time rule: the API stops taking seats at the start, so every surface closes then too.
export function hasEventStarted(startsAt: string | Date, now: Date): boolean {
  return now.getTime() >= new Date(startsAt).getTime();
}

// setTimeout overflows past about 24.8 days and fires at once, so long waits go in steps.
const MAX_TIMEOUT_MS = 2_147_483_647;

export function toStartDelayMs(startsAt: string | Date, now: Date): number {
  const delay = new Date(startsAt).getTime() - now.getTime();
  return Math.min(Math.max(delay, 0), MAX_TIMEOUT_MS);
}

type EventCardTimingInput = Pick<
  EventCardData,
  "is_past" | "starts_at" | "available_seats" | "total_seats"
>;

// The card's second line: seats while a date is ahead, then what became of it.
export function toEventCardSeatsLabel(
  event: EventCardTimingInput,
  now: Date,
): string {
  if (event.is_past) return "Wrapped up";
  if (hasEventStarted(event.starts_at, now)) return "Under way";
  return toSeatsLabel(event.available_seats, event.total_seats);
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

interface SeatPriceShownInput {
  state: ReserveState;
  isPast: boolean;
  hasStarted: boolean;
  bookingStatus: RegistrationStatus | null;
}

const UNPAID_STATUSES = new Set<RegistrationStatus>([
  RegistrationStatus.Pending,
  RegistrationStatus.Approved,
]);

// A price only matters while a seat can still be had, or is still to be paid for.
export function isSeatPriceShown(input: SeatPriceShownInput): boolean {
  if (input.state === "open" || input.state === "soldOut") return true;
  if (input.state !== "booked" || input.isPast || input.hasStarted) {
    return false;
  }
  return (
    input.bookingStatus !== null && UNPAID_STATUSES.has(input.bookingStatus)
  );
}

const SEAT_PRICE_NOTE: Record<EventType, string | null> = {
  [EventType.PotteryWorkshop]:
    "Clay, tools and firing are part of the seat price.",
  [EventType.OpenMic]: null,
};

// The editor's own includes list is the truth when there is one, so the stock line steps aside.
export function toSeatPriceNote(
  eventType: EventType,
  includes: string[],
): string | null {
  return includes.length > 0 ? null : SEAT_PRICE_NOTE[eventType];
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

const SEAT_STAGES = toRequestStages(
  "We have your request and are holding your seat.",
  "seat",
);

export const REGISTRATION_STAGES = SEAT_STAGES.paid;

const SEAT_LAPSED_LINE =
  "The event began before we answered. Message us and we'll find you another.";

// The saved total decides the steps, so a seat made free later keeps the steps it was booked with.
export function toRegistrationStages(
  total: number,
  isLapsed: boolean,
): TimelineStage<RegistrationStatus>[] {
  const stages = total === 0 ? SEAT_STAGES.free : SEAT_STAGES.paid;
  return isLapsed ? withRequestedLine(stages, SEAT_LAPSED_LINE) : stages;
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
    [RegistrationStatus.Pending]: toTimelineDate(registration.created_at),
    [RegistrationStatus.Approved]: toTimelineDate(registration.approved_at),
    [RegistrationStatus.Confirmed]: toTimelineDate(registration.confirmed_at),
  };
}

type ClosedLabelInput = Pick<
  RegistrationData,
  "status" | "cancelled_at" | "rejected_at" | "cancel_reason"
>;

// "Cancelled on 12 Sep, 2026, 2:30 pm · Away that week", or null while the booking is open.
export function toRegistrationClosedLabel(
  registration: ClosedLabelInput,
): string | null {
  if (!isRegistrationClosed(registration.status)) return null;
  return toClosedLabel(
    // Only cancelled and not-approved reach here, which read the same free or paid.
    toRegistrationStatusLabel(registration.status, false),
    toTimelineDate(registration.cancelled_at ?? registration.rejected_at),
    registration.cancel_reason,
  );
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

// The receipt speaks for a request, so it goes once the studio has answered.
// A saved "just placed" link to a request whose date has since passed would promise a reply too late.
export function isRequestBannerShown(
  isJustPlaced: boolean,
  status: RegistrationStatus,
  isLapsed: boolean,
): boolean {
  return isJustPlaced && status === RegistrationStatus.Pending && !isLapsed;
}

type RegistrationGroupKey = "underWay" | "upcoming" | "past";

type GroupableRegistration = Pick<RegistrationData, "status"> & {
  event: Pick<RegistrationData["event"], "is_past" | "starts_at">;
};

export interface RegistrationGroup<T extends GroupableRegistration> {
  key: RegistrationGroupKey;
  heading: string;
  registrations: T[];
}

// Like wheel sessions: a date that has run, or a seat that will never be taken, sits under Past.
// A date that has begun but not ended is neither ahead nor done, so it gets its own group.
function toRegistrationGroupKey(
  registration: GroupableRegistration,
  now: Date,
): RegistrationGroupKey {
  if (isRegistrationClosed(registration.status)) return "past";
  if (registration.event.is_past) return "past";
  return hasEventStarted(registration.event.starts_at, now)
    ? "underWay"
    : "upcoming";
}

function byStart(a: GroupableRegistration, b: GroupableRegistration): number {
  return (
    new Date(a.event.starts_at).getTime() -
    new Date(b.event.starts_at).getTime()
  );
}

// Soonest first for what is ahead, latest first for the record; empty groups are left out.
// The API pages in the same order, so the groups hold across pages.
export function toRegistrationGroups<T extends GroupableRegistration>(
  registrations: T[],
  now: Date,
): RegistrationGroup<T>[] {
  const inGroup = (key: RegistrationGroupKey) =>
    registrations.filter(
      (registration) => toRegistrationGroupKey(registration, now) === key,
    );
  const groups: RegistrationGroup<T>[] = [
    {
      key: "underWay",
      heading: "Under way",
      registrations: inGroup("underWay").sort(byStart),
    },
    {
      key: "upcoming",
      heading: "Upcoming",
      registrations: inGroup("upcoming").sort(byStart),
    },
    {
      key: "past",
      heading: "Past and cancelled",
      registrations: inGroup("past").sort((a, b) => byStart(b, a)),
    },
  ];
  return groups.filter((group) => group.registrations.length > 0);
}

export interface WhatsAppBookingInput {
  registrationId: string;
  eventTitle: string;
  when: string;
  seats: number;
  total: string;
  guestName: string;
  isFree: boolean;
  // The date passed before the studio answered, so the guest asks for a new one, not approval.
  isLapsed: boolean;
}

export function toWhatsAppBookingMessage(input: WhatsAppBookingInput): string {
  return [
    // Nothing was booked if the studio never answered, so the opening says what was asked for.
    input.isLapsed
      ? `Hi! I asked for a seat at ${input.eventTitle} on Poetry & Pottery.`
      : `Hi! I booked ${input.eventTitle} on Poetry & Pottery.`,
    `Booking: ${input.registrationId}`,
    `When: ${input.when}`,
    `Seats: ${input.seats}`,
    // A free or lapsed booking has nothing to pay, so a total line would only read like a bill.
    input.isFree || input.isLapsed ? null : `Total: ${input.total}`,
    `Name: ${input.guestName}`,
    input.isLapsed
      ? "The event began before I heard back. Is there another one I could join?"
      : input.isFree
        ? "Could you confirm my seat?"
        : "Could you approve my request and share payment details?",
  ]
    .filter((line) => line !== null)
    .join("\n");
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

const PAID_SEAT_POLICY: readonly PolicyPoint[] = [
  {
    term: "Before you pay",
    detail: "You can withdraw your request at no cost.",
  },
  {
    term: "Once paid, it's final",
    detail:
      "Your seat stays yours. It can't be cancelled or refunded if your plans change.",
  },
  {
    term: "Sending someone else",
    detail:
      "If you can't come, a friend or family member can take your seat. Tell us their name before the event.",
  },
  {
    term: "Missed events",
    detail: "If you miss the event, your seat isn't refunded or moved.",
  },
  {
    term: "If we cancel",
    detail:
      "If we have to cancel or move the event, you choose a full refund or a seat at another event.",
  },
];

// A free seat has nothing to pay or refund, so its policy keeps only what still applies.
const FREE_SEAT_POLICY: readonly PolicyPoint[] = [
  {
    term: "If you can't come",
    detail:
      "If you can't come, please withdraw so someone else can have the seat.",
  },
  {
    term: "Sending someone else",
    detail:
      "A friend or family member can take your seat instead. Tell us their name before the event.",
  },
  {
    term: "If we cancel",
    detail:
      "If we have to cancel or move the event, we'll let you know as soon as we can.",
  },
];

export function toSeatPolicy(isFree: boolean): readonly PolicyPoint[] {
  return isFree ? FREE_SEAT_POLICY : PAID_SEAT_POLICY;
}
