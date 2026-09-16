import {
  type AdminEventDetailFragment,
  type AdminEventInput,
  EventLevel,
  EventStatus,
  EventType,
} from "@/graphql/generated/graphql";

import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import type { EventFormValues } from "@/lib/validations/admin/event";

// The studio runs on IST all year, so the console shows studio time wherever the admin sits.
const IST_OFFSET_MINUTES = 330;
const MINUTE_MS = 60_000;
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function toDateTimeLocal(iso: string): string {
  const stamp = Date.parse(iso);
  if (Number.isNaN(stamp)) return "";
  return new Date(stamp + IST_OFFSET_MINUTES * MINUTE_MS)
    .toISOString()
    .slice(0, 16);
}

export function fromDateTimeLocal(value: string): string {
  const trimmed = value.trim().slice(0, 16);
  if (!LOCAL_DATETIME.test(trimmed)) return "";
  const asUtc = Date.parse(`${trimmed}:00.000Z`);
  if (Number.isNaN(asUtc)) return "";
  return new Date(asUtc - IST_OFFSET_MINUTES * MINUTE_MS).toISOString();
}

export function toLines(values: readonly string[]): string {
  return values.join("\n");
}

export function fromLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function describeSeats(available: number, total: number): string {
  return `${available} of ${total}`;
}

/** One line for the when column: the date once, then the two times. */
export function describeWhen(startsAt: string, endsAt: string): string {
  if (Number.isNaN(Date.parse(startsAt))) return "";
  if (Number.isNaN(Date.parse(endsAt))) return formatDateTime(startsAt);
  const isSameDay = formatDate(startsAt) === formatDate(endsAt);
  return isSameDay
    ? `${formatDateTime(startsAt)} – ${formatTime(endsAt)}`
    : `${formatDateTime(startsAt)} – ${formatDateTime(endsAt)}`;
}

export function toEventStatus(value: string): EventStatus | null {
  return Object.values(EventStatus).find((member) => member === value) ?? null;
}

export function toEventType(value: string): EventType | null {
  return Object.values(EventType).find((member) => member === value) ?? null;
}

export type EventAction = "publish" | "unpublish" | "complete" | "cancel";

const ACTIONS_BY_STATUS: Record<EventStatus, EventAction[]> = {
  [EventStatus.Draft]: ["publish", "cancel"],
  [EventStatus.Published]: ["unpublish", "complete", "cancel"],
  [EventStatus.Completed]: [],
  [EventStatus.Cancelled]: [],
};

const ACTION_LABEL: Record<EventAction, string> = {
  publish: "Publish",
  unpublish: "Unpublish",
  complete: "Mark complete",
  cancel: "Cancel event",
};

const ACTION_STATUS: Record<EventAction, EventStatus> = {
  publish: EventStatus.Published,
  unpublish: EventStatus.Draft,
  complete: EventStatus.Completed,
  cancel: EventStatus.Cancelled,
};

const ACTION_DONE: Record<EventAction, string> = {
  publish: "Event published",
  unpublish: "Event back to draft",
  complete: "Event marked complete",
  cancel: "Event cancelled",
};

/** A finished or cancelled event is an end; nothing moves it again. */
export function allowedEventActions(status: EventStatus): EventAction[] {
  return [...ACTIONS_BY_STATUS[status]];
}

export function eventActionLabel(action: EventAction): string {
  return ACTION_LABEL[action];
}

export function eventActionStatus(action: EventAction): EventStatus {
  return ACTION_STATUS[action];
}

export function eventActionDoneMessage(action: EventAction): string {
  return ACTION_DONE[action];
}

export function eventActionNeedsReason(action: EventAction): boolean {
  return action === "cancel";
}

export function isDestructiveEventAction(action: EventAction): boolean {
  return action === "cancel";
}

export function isWorkshop(eventType: EventType): boolean {
  return eventType === EventType.PotteryWorkshop;
}

export const EMPTY_EVENT_FORM: EventFormValues = {
  title: "",
  description: "",
  event_type: EventType.PotteryWorkshop,
  level: EventLevel.AllLevels,
  starts_at: "",
  ends_at: "",
  location: "",
  address: "",
  price: 0,
  total_seats: 1,
  instructor: "",
  image_url: "",
  gallery: [],
  highlights: "",
  includes: "",
  performers: "",
};

export function toEventFormValues(
  event: AdminEventDetailFragment,
): EventFormValues {
  return {
    title: event.title,
    description: event.description,
    event_type: event.event_type,
    level: event.level ?? EventLevel.AllLevels,
    starts_at: toDateTimeLocal(event.starts_at),
    ends_at: toDateTimeLocal(event.ends_at),
    location: event.location,
    address: event.address,
    price: event.price,
    total_seats: event.total_seats,
    instructor: event.instructor ?? "",
    image_url: event.image_url,
    gallery: event.gallery,
    highlights: toLines(event.highlights),
    includes: toLines(event.includes),
    performers: toLines(event.performers),
  };
}

/** A workshop carries a level and an instructor; an open mic carries performers. */
export function toEventInput(values: EventFormValues): AdminEventInput {
  const input: AdminEventInput = {
    title: values.title.trim(),
    description: values.description.trim(),
    event_type: values.event_type,
    starts_at: fromDateTimeLocal(values.starts_at),
    ends_at: fromDateTimeLocal(values.ends_at),
    location: values.location.trim(),
    address: values.address.trim(),
    price: values.price,
    total_seats: values.total_seats,
    image_url: values.image_url.trim(),
    gallery: values.gallery,
    highlights: fromLines(values.highlights),
    includes: fromLines(values.includes),
  };

  if (isWorkshop(values.event_type)) {
    input.level = values.level;
    input.instructor = values.instructor.trim();
  } else {
    input.performers = fromLines(values.performers);
  }

  return input;
}
