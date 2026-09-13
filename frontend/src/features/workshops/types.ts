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
  }).format(new Date(instant));
}

export function formatSlotRange(
  startsAt: string | Date,
  endsAt: string | Date,
  timezone: string,
): string {
  return `${formatSlotTime(startsAt, timezone)} – ${formatSlotTime(endsAt, timezone)}`;
}

export function formatSessionDate(
  instant: string | Date,
  timezone: string,
): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(instant));
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

function slotsPerSession(hours: number, slotMinutes: number): number {
  return Math.max(1, Math.round((hours * 60) / slotMinutes));
}

// A session of N slots fits at a start when every consecutive slot exists, is open and has room.
export function isSessionBookable(
  slots: WorkshopSlotData[],
  startsAt: string,
  hours: number,
  participants: number,
  slotMinutes: number,
): boolean {
  const needed = slotsPerSession(hours, slotMinutes);
  const startIndex = slots.findIndex((slot) => slot.starts_at === startsAt);
  if (startIndex === -1) return false;
  for (let offset = 0; offset < needed; offset += 1) {
    const slot = slots[startIndex + offset];
    if (!slot || !slot.is_available || slot.remaining < participants)
      return false;
    const previous = slots[startIndex + offset - 1];
    if (offset > 0 && previous && previous.ends_at !== slot.starts_at)
      return false;
  }
  return true;
}

// How many people could still book a session starting at this slot.
export function sessionCapacity(
  slots: WorkshopSlotData[],
  startsAt: string,
  hours: number,
  slotMinutes: number,
): number {
  const needed = slotsPerSession(hours, slotMinutes);
  const startIndex = slots.findIndex((slot) => slot.starts_at === startsAt);
  if (startIndex === -1) return 0;
  let capacity = Number.POSITIVE_INFINITY;
  for (let offset = 0; offset < needed; offset += 1) {
    const slot = slots[startIndex + offset];
    if (!slot || !slot.is_available) return 0;
    capacity = Math.min(capacity, slot.remaining);
  }
  return Number.isFinite(capacity) ? capacity : 0;
}

export function bookableStarts(
  day: WorkshopDayData | undefined,
  hours: number,
  participants: number,
  slotMinutes: number,
): WorkshopSlotData[] {
  if (!day || day.is_closed) return [];
  return day.slots.filter((slot) =>
    isSessionBookable(
      day.slots,
      slot.starts_at,
      hours,
      participants,
      slotMinutes,
    ),
  );
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
