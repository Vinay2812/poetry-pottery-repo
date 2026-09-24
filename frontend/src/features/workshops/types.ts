import {
  DayClosedKind,
  RegistrationStatus,
  type WorkshopAvailabilityQuery,
  type WorkshopBookingFieldsFragment,
  type WorkshopConfigFieldsFragment,
} from "@/graphql/generated/graphql";

import { buildWhatsAppUrl } from "@/features/layout/types";
import type { StatusTone } from "@/features/orders/types";

export type WorkshopData = WorkshopConfigFieldsFragment;
export type WorkshopTierData = WorkshopData["tiers"][number];
export type WorkshopDayData =
  WorkshopAvailabilityQuery["workshopAvailability"][number];
export type WorkshopSlotData = WorkshopDayData["slots"][number];
export type BookingData = WorkshopBookingFieldsFragment;

export const SESSION_NOTE =
  "Everything you make is fired and glazed by us, ready in about two weeks";

export interface SessionFact {
  label: string;
  value: string;
}

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function toWorkshopPath(slug: string): string {
  return `/workshops/${slug}`;
}

export function toBookingPath(id: string): string {
  return `/workshops/bookings/${id}`;
}

// Date keys are calendar days in the studio's timezone, never the visitor's.
export function toDateKey(instant: string | Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(instant));
  return parts;
}

export function formatDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)));
}

function formatSlotTime(instant: string | Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  })
    .format(new Date(instant))
    .replace(":00", "");
}

// "3–4 pm" when both ends share a meridiem, "11 am–12 pm" when they do not.
export function formatHourRange(
  startsAt: string | Date,
  endsAt: string | Date,
  timezone: string,
): string {
  const from = formatSlotTime(startsAt, timezone);
  const to = formatSlotTime(endsAt, timezone);
  const [fromTime, fromMeridiem] = from.split(" ");
  const [toTime, toMeridiem] = to.split(" ");
  if (fromMeridiem && fromMeridiem === toMeridiem) {
    return `${fromTime}–${toTime} ${toMeridiem}`;
  }
  return `${from}–${to}`;
}

function formatDayLabel(instant: string | Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: timezone,
  }).format(new Date(instant));
}

export interface SlotInterval {
  starts_at: string;
  ends_at: string;
}

interface SlotDayGroup {
  dateKey: string;
  dayLabel: string;
  timesLabel: string;
}

// Booked hours read as one line per day: "Sat 20 Sep · 3–4 pm, 4–5 pm".
export function groupSlotsByDay(
  slots: SlotInterval[],
  timezone: string,
): SlotDayGroup[] {
  const groups = new Map<string, string[]>();
  for (const slot of [...slots].sort((a, b) =>
    a.starts_at.localeCompare(b.starts_at),
  )) {
    const dateKey = toDateKey(slot.starts_at, timezone);
    const times = groups.get(dateKey) ?? [];
    times.push(formatHourRange(slot.starts_at, slot.ends_at, timezone));
    groups.set(dateKey, times);
  }
  return [...groups.entries()].map(([dateKey, times]) => ({
    dateKey,
    dayLabel: formatDayLabel(`${dateKey}T12:00:00.000Z`, "UTC"),
    timesLabel: times.join(", "),
  }));
}

// The card already names the days above, so a single-day booking lists only its times.
export function toBookingWhenLines(
  slots: SlotInterval[],
  timezone: string,
): string[] {
  const groups = groupSlotsByDay(slots, timezone);
  if (groups.length === 1) return [groups[0]?.timesLabel ?? ""];
  return groups.map((group) => `${group.dayLabel} · ${group.timesLabel}`);
}

export function formatDayRange(
  slots: SlotInterval[],
  timezone: string,
): string {
  const groups = groupSlotsByDay(slots, timezone);
  const first = groups[0];
  const last = groups[groups.length - 1];
  if (!first || !last) return "";
  return first.dateKey === last.dateKey
    ? first.dayLabel
    : `${first.dayLabel} – ${last.dayLabel}`;
}

export function pickTier(
  tiers: WorkshopTierData[],
  hours: number,
): WorkshopTierData | null {
  return tiers.find((tier) => tier.hours === hours) ?? null;
}

export function quoteSession(
  tier: WorkshopTierData | null,
  participants: number,
): { subtotal: number; pieces: number } {
  if (!tier) return { subtotal: 0, pieces: 0 };
  return {
    subtotal: tier.price_per_person * participants,
    pieces: tier.pieces_per_person * participants,
  };
}

// One sentence above the pickers that says how the hours are chosen, before anyone scrolls.
export function toPickingGuide(
  needed: number,
  allowedSpanDays: number,
): string {
  const hours = needed === 1 ? "1 hour" : `${needed} hours`;
  if (needed === 1) {
    return `Pick a day on the calendar, then ${hours} from the times under it.`;
  }
  return allowedSpanDays === 1
    ? `Pick a day on the calendar, then ${hours} from the times under it; they all sit on that one day.`
    : `Pick a day on the calendar, then ${hours} from the times under it. They can sit on different days, within ${allowedSpanDays} days of your first one.`;
}

// A party bigger than the wheels is a special request, so the ask names the session and the size.
export function toGroupAskUrl(
  whatsappNumber: string,
  workshopName: string,
  wheels: number,
): string | null {
  if (whatsappNumber.replace(/\D/g, "").length === 0) return null;
  return buildWhatsAppUrl(
    whatsappNumber,
    `Hi, we are a group of more than ${wheels} for ${workshopName}. Could you set up a group session for us?`,
  );
}

export function toGroupAskLine(wheels: number): string {
  return `More than ${wheels} of you? The studio has ${wheels} wheels, but ask us and we will work out a group session.`;
}

// When the month cannot hold the request, the studio may still arrange it by hand.
export function toArrangementAskUrl(
  whatsappNumber: string,
  workshopName: string,
  hours: number,
  participants: number,
): string | null {
  if (whatsappNumber.replace(/\D/g, "").length === 0) return null;
  const people = participants === 1 ? "one person" : `${participants} people`;
  return buildWhatsAppUrl(
    whatsappNumber,
    `Hi, I am after ${formatHours(hours)} at the wheel for ${people} (${workshopName}) but nothing is free this month. Could you arrange something?`,
  );
}

export function toUnavailableMessage(
  hours: number,
  participants: number,
): string {
  const people = participants === 1 ? "one person" : `${participants} people`;
  return `Nothing free for ${formatHours(hours)} for ${people} this month. Try another month, fewer hours or fewer people.`;
}

export const SUGGESTED_NOTE =
  "Picked for you: the earliest free hours. Change any of them.";

export function formatPickedProgress(picked: number, needed: number): string {
  return `${picked} of ${needed} ${needed === 1 ? "hour" : "hours"} picked`;
}

interface WhatsAppSessionInput {
  bookingId: string;
  when: string;
  hours: number;
  participants: number;
  total: string;
  guestName: string;
}

export function toWhatsAppSessionMessage(input: WhatsAppSessionInput): string {
  return [
    "Hi! I booked a wheel session on Poetry & Pottery.",
    `Booking: ${input.bookingId}`,
    `When: ${input.when}`,
    `${input.hours} ${input.hours === 1 ? "hour" : "hours"} for ${input.participants} ${input.participants === 1 ? "person" : "people"}`,
    `Total: ${input.total}`,
    `Name: ${input.guestName}`,
    "Could you confirm it and share payment details?",
  ].join("\n");
}

interface BookingStep {
  key: RegistrationStatus;
  label: string;
  description: string;
}

export const BOOKING_STEPS: BookingStep[] = [
  {
    key: RegistrationStatus.Pending,
    label: "Requested",
    description: "We have your request and are checking the wheel.",
  },
  {
    key: RegistrationStatus.Approved,
    label: "Wheel held",
    description: "Your wheel is held. We share payment details on WhatsApp.",
  },
  {
    key: RegistrationStatus.Confirmed,
    label: "Confirmed",
    description: "Paid and confirmed. Come in ten minutes early.",
  },
];

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: "Awaiting confirmation",
  [RegistrationStatus.Approved]: "Wheel held, awaiting payment",
  [RegistrationStatus.Confirmed]: "Confirmed",
  [RegistrationStatus.Rejected]: "Not confirmed",
  [RegistrationStatus.Cancelled]: "Cancelled",
};

export function toBookingStatusLabel(status: RegistrationStatus): string {
  return STATUS_LABEL[status];
}

export function toBookingStatusTone(status: RegistrationStatus): StatusTone {
  if (
    status === RegistrationStatus.Cancelled ||
    status === RegistrationStatus.Rejected
  )
    return "off";
  if (status === RegistrationStatus.Confirmed) return "done";
  if (status === RegistrationStatus.Pending) return "pending";
  return "active";
}

// Closed bookings freeze on the step they stopped at.
export function toBookingStepIndex(status: RegistrationStatus): number {
  const index = BOOKING_STEPS.findIndex((step) => step.key === status);
  return index === -1 ? 0 : index;
}

type BookingGroup = "upcoming" | "past";

// A session that has run, or one the studio will never run, belongs behind the ones
// still ahead of the visitor.
export function toBookingGroup(
  slots: SlotInterval[],
  status: RegistrationStatus,
  now = new Date(),
): BookingGroup {
  if (isBookingClosed(status)) return "past";
  const last = slots.reduce(
    (latest, slot) => (slot.ends_at > latest ? slot.ends_at : latest),
    "",
  );
  return last && new Date(last) > now ? "upcoming" : "past";
}

export function isBookingClosed(status: RegistrationStatus): boolean {
  return (
    status === RegistrationStatus.Cancelled ||
    status === RegistrationStatus.Rejected
  );
}

export function formatHours(hours: number): string {
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export function formatWheels(remaining: number): string {
  return `${remaining} ${remaining === 1 ? "wheel" : "wheels"} free`;
}

interface CalendarDayState {
  wheelsFree: number;
  pickedCount: number;
  isClosed: boolean;
  closedKind: DayClosedKind | null;
  isPast: boolean;
  mutedReason: string | null;
}

interface DayNote {
  caption: string;
  description: string;
  isPickable: boolean;
}

// A day that cannot be booked says why on the face of it: past, closed, full, or out of
// reach of the hours already picked. "Studio closed" was answering all four.
export function toDayNote(day: CalendarDayState): DayNote {
  if (day.isPast) {
    return { caption: "past", description: "past", isPickable: false };
  }
  if (day.closedKind === DayClosedKind.NotYetOpen) {
    return {
      caption: "not yet",
      description: "bookings not open yet",
      isPickable: false,
    };
  }
  if (day.closedKind === DayClosedKind.FullyBooked) {
    return {
      caption: "full",
      description: "no wheels free",
      isPickable: false,
    };
  }
  if (day.closedKind === DayClosedKind.NoSessionsLeft) {
    return {
      caption: "none left",
      description: "no sessions left today",
      isPickable: false,
    };
  }
  if (day.isClosed) {
    return {
      caption: "closed",
      description: "studio closed",
      isPickable: false,
    };
  }
  if (day.wheelsFree <= 0) {
    return {
      caption: "full",
      description: "no wheels free",
      isPickable: false,
    };
  }
  if (day.mutedReason) {
    return {
      caption: "too far",
      description: day.mutedReason.toLowerCase(),
      isPickable: false,
    };
  }
  const free = formatWheels(day.wheelsFree);
  return {
    caption: free,
    description:
      day.pickedCount > 0 ? `${free}, ${day.pickedCount} picked` : free,
    isPickable: true,
  };
}

type BookingAction =
  | { kind: "cancel"; reason: string; at: string }
  | { kind: "reschedule"; slots: readonly SlotInterval[] };

// The reducer behind the optimistic booking: what the studio will say once it agrees.
export function applyBookingAction(
  booking: BookingData | null,
  action: BookingAction,
): BookingData | null {
  if (!booking) return booking;
  if (action.kind === "cancel") {
    return {
      ...booking,
      status: RegistrationStatus.Cancelled,
      can_cancel: false,
      can_reschedule: false,
      cancelled_at: action.at,
      cancel_reason: action.reason.trim() || booking.cancel_reason,
    };
  }
  const slots = [...action.slots].sort((a, b) =>
    a.starts_at.localeCompare(b.starts_at),
  );
  const first = slots[0];
  const last = slots[slots.length - 1];
  if (!first || !last) return booking;
  return {
    ...booking,
    slots: slots.map((slot) => ({
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
    })),
    starts_at: first.starts_at,
    ends_at: last.ends_at,
  };
}
