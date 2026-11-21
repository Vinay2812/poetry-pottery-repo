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
  "Everything you make is fired and glazed by us, ready in about two weeks.";

// Owner-approved policy wording; the booking page and the cancel dialog both show it as is.
export const CANCELLING_RULE =
  "Cancel at least 4 days before your session for a full refund. After that, we refund only if we can fill your seat from the waitlist or with someone you refer.";

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

// Hours are picked one slot at a time, so a booking needs this many of them.
export function slotsNeeded(hours: number, slotMinutes: number): number {
  // Matches the API's slotsPerBooking, which rounds up so a session never runs short.
  return Math.max(1, Math.ceil((hours * 60) / slotMinutes));
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

// Booked hours read as one line per day, back-to-back hours as one stretch: "Sat 20 Sep · 1–3 pm, 5–6 pm".
export function groupSlotsByDay(
  slots: SlotInterval[],
  timezone: string,
): SlotDayGroup[] {
  const groups = new Map<string, SlotInterval[]>();
  for (const slot of [...slots].sort((a, b) =>
    a.starts_at.localeCompare(b.starts_at),
  )) {
    const dateKey = toDateKey(slot.starts_at, timezone);
    const stretches = groups.get(dateKey) ?? [];
    const last = stretches[stretches.length - 1];
    if (
      last &&
      new Date(last.ends_at).getTime() === new Date(slot.starts_at).getTime()
    ) {
      stretches[stretches.length - 1] = { ...last, ends_at: slot.ends_at };
    } else {
      stretches.push({ starts_at: slot.starts_at, ends_at: slot.ends_at });
    }
    groups.set(dateKey, stretches);
  }
  return [...groups.entries()].map(([dateKey, stretches]) => ({
    dateKey,
    dayLabel: formatDayLabel(`${dateKey}T12:00:00.000Z`, "UTC"),
    timesLabel: stretches
      .map((stretch) =>
        formatHourRange(stretch.starts_at, stretch.ends_at, timezone),
      )
      .join(", "),
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

// The rule behind the days a picked set closes off, counted from the slot_span_days setting.
export function toSpanRule(allowedSpanDays: number): string {
  return allowedSpanDays === 1
    ? "Pick all your hours on the same day"
    : `Pick all your hours within a ${allowedSpanDays}-day window`;
}

interface PickingGuideInput {
  hours: number;
  // How many times of day the hours take; with one there is no window to keep to.
  timesNeeded: number;
  allowedSpanDays: number;
}

// Says how the hours are chosen; the intro and the empty summary both read it.
export function toPickingGuide({
  hours,
  timesNeeded,
  allowedSpanDays,
}: PickingGuideInput): string {
  const guide = `Pick a day on the calendar, then ${formatHours(hours)} from the times under it.`;
  return timesNeeded > 1 ? `${guide} ${toSpanRule(allowedSpanDays)}.` : guide;
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
  "Picked for you: the earliest free times. Change any of them.";

// "90 minutes" reads as "1 hour 30 minutes"; whole hours stay "2 hours".
export function formatDuration(minutes: number): string {
  const wholeHours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return formatHours(wholeHours);
  if (wholeHours === 0) return `${rest} minutes`;
  return `${formatHours(wholeHours)} ${rest} minutes`;
}

// Progress is time at the wheel, not the number of times picked, which depends on slot length.
export function formatPickedProgress(
  pickedMinutes: number,
  hours: number,
): string {
  const neededMinutes = hours * 60;
  if (pickedMinutes === 0) return `Pick ${formatHours(hours)}`;
  if (pickedMinutes >= neededMinutes) {
    return hours === 1 ? "1 hour picked" : `All ${formatHours(hours)} picked`;
  }
  if (pickedMinutes % 60 === 0) {
    return `${pickedMinutes / 60} of ${formatHours(hours)} picked`;
  }
  return `${formatDuration(pickedMinutes)} of ${formatHours(hours)} picked`;
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
  // False when the API sent nothing for the day, which is not the same as closed.
  isLoaded: boolean;
  isClosed: boolean;
  closedKind: DayClosedKind | null;
  isPast: boolean;
  mutedReason: string | null;
}

interface DayNote {
  caption: string;
  // Fits a phone-width day cell on one line.
  shortCaption: string;
  description: string;
  isPickable: boolean;
}

// A day that cannot be booked says why: closed, full, or out of reach of the hours already
// picked. A past day's dimmed number says enough, so only screen readers hear "past".
export function toDayNote(day: CalendarDayState): DayNote {
  if (day.isPast) {
    return {
      caption: "",
      shortCaption: "",
      description: "past",
      isPickable: false,
    };
  }
  if (!day.isLoaded) {
    return {
      caption: "",
      shortCaption: "",
      description: "availability not loaded",
      isPickable: false,
    };
  }
  if (day.closedKind === DayClosedKind.NotYetOpen) {
    return {
      caption: "not yet",
      shortCaption: "not yet",
      description: "bookings not open yet",
      isPickable: false,
    };
  }
  if (day.closedKind === DayClosedKind.FullyBooked) {
    return {
      caption: "full",
      shortCaption: "full",
      description: "no wheels free",
      isPickable: false,
    };
  }
  if (day.closedKind === DayClosedKind.NoSessionsLeft) {
    return {
      caption: "none left",
      shortCaption: "none left",
      description: "no sessions left today",
      isPickable: false,
    };
  }
  if (day.isClosed) {
    return {
      caption: "closed",
      shortCaption: "closed",
      description: "studio closed",
      isPickable: false,
    };
  }
  if (day.wheelsFree <= 0) {
    return {
      caption: "full",
      shortCaption: "full",
      description: "no wheels free",
      isPickable: false,
    };
  }
  if (day.mutedReason) {
    return {
      caption: "too far",
      shortCaption: "too far",
      description: day.mutedReason.toLowerCase(),
      isPickable: false,
    };
  }
  const free = formatWheels(day.wheelsFree);
  return {
    caption: free,
    shortCaption: `${day.wheelsFree} free`,
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
