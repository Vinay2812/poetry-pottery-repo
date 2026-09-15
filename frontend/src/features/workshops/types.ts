import {
  RegistrationStatus,
  type WorkshopAvailabilityQuery,
  type WorkshopBookingFieldsFragment,
  type WorkshopConfigFieldsFragment,
} from "@/graphql/generated/graphql";

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

export function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shifted = new Date(
    Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + days),
  );
  return shifted.toISOString().slice(0, 10);
}

export function toMonthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const next = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1 + delta, 1));
  return next.toISOString().slice(0, 7);
}

export function daysInMonth(monthKey: string): number {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year ?? 1970, month ?? 1, 0)).getUTCDate();
}

export function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, 1)));
}

// Monday-first grid of date keys with nulls padding the first and last week.
export function toMonthGrid(monthKey: string): (string | null)[][] {
  const [year, month] = monthKey.split("-").map(Number);
  const first = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const total = daysInMonth(monthKey);
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= total; day += 1) {
    cells.push(`${monthKey}-${String(day).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7)
    weeks.push(cells.slice(index, index + 7));
  return weeks;
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

// "Sat 20 Sep · 3–4 pm", the one line a picked hour gets everywhere it is listed.
export function formatSlotLine(slot: SlotInterval, timezone: string): string {
  return `${formatDayLabel(slot.starts_at, timezone)} · ${formatHourRange(slot.starts_at, slot.ends_at, timezone)}`;
}

export interface SlotDayGroup {
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

// Hours are picked one slot at a time, so a booking needs this many of them.
export function slotsNeeded(hours: number, slotMinutes: number): number {
  return Math.max(1, Math.round((hours * 60) / slotMinutes));
}

export function isSlotPickable(
  slot: WorkshopSlotData,
  participants: number,
): boolean {
  return slot.is_available && slot.remaining >= participants;
}

export function pickableSlots(
  day: WorkshopDayData | undefined,
  participants: number,
): WorkshopSlotData[] {
  if (!day || day.is_closed) return [];
  return day.slots.filter((slot) => isSlotPickable(slot, participants));
}

function dayDelta(later: string, earlier: string): number {
  const [ly, lm, ld] = later.split("-").map(Number);
  const [ey, em, ed] = earlier.split("-").map(Number);
  return Math.round(
    (Date.UTC(ly ?? 0, (lm ?? 1) - 1, ld ?? 1) -
      Date.UTC(ey ?? 0, (em ?? 1) - 1, ed ?? 1)) /
      86_400_000,
  );
}

// Calendar days covered by a set of day keys, counting both ends.
export function spanDays(dateKeys: string[]): number {
  if (dateKeys.length === 0) return 0;
  const sorted = [...dateKeys].sort();
  return dayDelta(sorted[sorted.length - 1] ?? "", sorted[0] ?? "") + 1;
}

// A day stays open while adding it keeps the whole set inside the allowed span.
export function isDayWithinSpan(
  dateKey: string,
  pickedDateKeys: string[],
  allowedSpanDays: number,
): boolean {
  if (pickedDateKeys.length === 0) return true;
  return spanDays([...pickedDateKeys, dateKey]) <= allowedSpanDays;
}

export function spanNotice(allowedSpanDays: number): string {
  return allowedSpanDays === 1
    ? "Pick every hour on the same day"
    : `Pick within ${allowedSpanDays} days of your first slot`;
}

export interface PickedSlotLabel {
  startsAt: string;
  label: string;
}

// Picked hours are always shown and sent in the order they happen.
export function toPickedSlots(
  picked: SlotInterval[],
  timezone: string,
): PickedSlotLabel[] {
  return [...picked]
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .map((slot) => ({
      startsAt: slot.starts_at,
      label: formatSlotLine(slot, timezone),
    }));
}

// Tapping an hour adds or drops it; once the tier is filled, further hours are ignored.
export function togglePicked(
  picked: SlotInterval[],
  slot: SlotInterval,
  needed: number,
): SlotInterval[] {
  if (picked.some((candidate) => candidate.starts_at === slot.starts_at)) {
    return picked.filter((candidate) => candidate.starts_at !== slot.starts_at);
  }
  if (picked.length >= needed) return picked;
  return [...picked, { starts_at: slot.starts_at, ends_at: slot.ends_at }];
}

export function formatPickedProgress(picked: number, needed: number): string {
  return `${picked} of ${needed} ${needed === 1 ? "hour" : "hours"} picked`;
}

export interface WhatsAppSessionInput {
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

export interface BookingStep {
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

export type BookingAction =
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
