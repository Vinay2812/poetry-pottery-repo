import type { WorkshopsQuery } from "@/graphql/generated/graphql";
import { formatInr } from "@/lib/format";

import { type EventCardData, toSeatsLabel } from "@/features/events/types";
import { slotsNeeded, toWorkshopPath } from "@/features/workshops/types";

export type StudioWheel = Pick<
  WorkshopsQuery["workshops"][number],
  | "slug"
  | "image_url"
  | "opening_minutes"
  | "closing_minutes"
  | "slot_minutes"
  | "slot_span_days"
  | "booking_window_days"
  | "closed_weekdays"
  | "tiers"
>;

export interface StudioSchedule {
  hoursLabel: string;
  daysLabel: string;
  priceLabel: string;
  offer: string;
}

interface StudioTeaserCopy {
  imageUrl: string | null;
  line: string;
  hoursLabel: string | null;
  daysLabel: string | null;
  priceLabel: string | null;
  href: string;
  linkLabel: string;
}

// The note sits under the heading beside event rows; the teaser replaces empty rows.
export interface StudioSection {
  // Present only while a wheel can be booked.
  bookingHref?: string;
  note?: string;
  teaser: StudioTeaserCopy | null;
}

export interface EventRowLabels {
  statusLabel: string;
  actionLabel: string;
}

// Registration closes when an event starts, though the feed lists it until it ends.
export function toEventRowLabels(
  event: Pick<EventCardData, "starts_at" | "available_seats" | "total_seats">,
  now: Date,
): EventRowLabels {
  if (new Date(event.starts_at) <= now) {
    return { statusLabel: "Registration closed", actionLabel: "Event details" };
  }
  return {
    statusLabel: toSeatsLabel(event.available_seats, event.total_seats),
    actionLabel: event.available_seats > 0 ? "Reserve" : "Event details",
  };
}

// Indexed like Date#getDay, so 0 is Sunday.
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Listing order: the working week first, Sunday last.
const WEEK_ORDER: readonly WeekdayIndex[] = [1, 2, 3, 4, 5, 6, 0];

const NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

function toNumberWord(value: number): string {
  return NUMBER_WORDS[value] ?? String(value);
}

function formatClockMinutes(minutes: number): string {
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const meridiem = hour24 < 12 ? "am" : "pm";
  const time =
    minute === 0 ? `${hour12}` : `${hour12}:${String(minute).padStart(2, "0")}`;
  return `${time} ${meridiem}`;
}

// "1 to 7 pm" when both ends share a meridiem, "11 am to 2 pm" when they do not.
export function toStudioHoursLabel(
  openingMinutes: number,
  closingMinutes: number,
): string {
  const from = formatClockMinutes(openingMinutes);
  const to = formatClockMinutes(closingMinutes);
  const [fromTime, fromMeridiem] = from.split(" ");
  const [, toMeridiem] = to.split(" ");
  return fromMeridiem === toMeridiem
    ? `${fromTime} to ${to}`
    : `${from} to ${to}`;
}

function joinWords(words: readonly string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

// Weekday numbers follow Date#getDay, so 0 is Sunday. Null when no day is open.
export function toStudioDaysLabel(
  closedWeekdays: readonly number[],
): string | null {
  const closed = new Set(closedWeekdays);
  const toName = (day: WeekdayIndex) => WEEKDAYS[day];
  const open = WEEK_ORDER.filter((day) => !closed.has(day)).map(toName);
  const shut = WEEK_ORDER.filter((day) => closed.has(day)).map(toName);
  if (open.length === 0) return null;
  if (shut.length === 0) return "Every day";
  // Name whichever list is shorter.
  if (open.length < shut.length) {
    return `${joinWords(open.map((day) => `${day}s`))} only`;
  }
  return `Every day except ${joinWords(shut)}`;
}

// "an hour", "two hours".
function toHoursPhrase(hours: number): string {
  return hours === 1 ? "an hour" : `${toNumberWord(hours)} hours`;
}

// The cheapest way onto a wheel, the shorter tier on a tie, and how long it buys.
export function toStudioPriceLabel(tiers: StudioWheel["tiers"]): string | null {
  const cheapest = [...tiers].sort(
    (a, b) => a.price_per_person - b.price_per_person || a.hours - b.hours,
  )[0];
  if (!cheapest) return null;
  return `From ${formatInr(cheapest.price_per_person)} a person for ${toHoursPhrase(cheapest.hours)}`;
}

// How long someone can book, said only as far as the tiers allow.
export function toStudioOffer(tiers: StudioWheel["tiers"]): string | null {
  const hours = [...new Set(tiers.map((tier) => tier.hours))].sort(
    (a, b) => a - b,
  );
  const shortest = hours[0];
  const longest = hours[hours.length - 1];
  if (shortest === undefined || longest === undefined) return null;
  const first = toHoursPhrase(shortest);
  if (hours.length === 1) return `Book ${first}.`;
  if (shortest === 1 && longest === 3) return "Book an hour or three.";
  return `Book ${first} or more.`;
}

// The most open weekdays in any run of consecutive days, wrapping round the week.
export function mostOpenDaysInRun(
  closedWeekdays: readonly number[],
  runDays: number,
): number {
  const closed = new Set(closedWeekdays);
  let most = 0;
  for (let first = 0; first < 7; first += 1) {
    let open = 0;
    for (let offset = 0; offset < runDays; offset += 1) {
      if (!closed.has((first + offset) % 7)) open += 1;
    }
    most = Math.max(most, open);
  }
  return most;
}

// Use the recurring window with the most open days to find which tiers fit.
export function toBookableTiers(wheel: StudioWheel): StudioWheel["tiers"] {
  if (wheel.slot_minutes <= 0) return [];
  const slotsPerDay = Math.floor(
    (wheel.closing_minutes - wheel.opening_minutes) / wheel.slot_minutes,
  );
  const reachableSpanDays = Math.min(
    wheel.slot_span_days,
    wheel.booking_window_days + 1,
  );
  const capacity =
    Math.max(0, slotsPerDay) *
    mostOpenDaysInRun(wheel.closed_weekdays, reachableSpanDays);
  return wheel.tiers.filter(
    (tier) => slotsNeeded(tier.hours, wheel.slot_minutes) <= capacity,
  );
}

// Only a wheel with an open day and a tier that fits can be offered at all.
export function toStudioSchedule(
  wheel: StudioWheel | null,
): StudioSchedule | null {
  if (!wheel) return null;
  const tiers = toBookableTiers(wheel);
  const daysLabel = toStudioDaysLabel(wheel.closed_weekdays);
  const priceLabel = toStudioPriceLabel(tiers);
  const offer = toStudioOffer(tiers);
  if (!daysLabel || !priceLabel || !offer) return null;
  return {
    hoursLabel: toStudioHoursLabel(
      wheel.opening_minutes,
      wheel.closing_minutes,
    ),
    daysLabel,
    priceLabel,
    offer,
  };
}

// Mid-sentence "Every day" reads lower case, a weekday keeps its capital.
function toMidSentence(label: string): string {
  return label.startsWith("Every")
    ? `${label.charAt(0).toLowerCase()}${label.slice(1)}`
    : label;
}

// The line under "At the studio" while events fill the rows below it.
export function toStudioNote(schedule: StudioSchedule): string {
  return `Wheel sessions run ${schedule.hoursLabel}, ${toMidSentence(schedule.daysLabel)}. ${schedule.offer}`;
}

// The first active wheel that can be booked, with what it offers.
function toBookableWheel(
  wheels: readonly StudioWheel[],
): { wheel: StudioWheel; schedule: StudioSchedule } | null {
  for (const wheel of wheels) {
    const schedule = toStudioSchedule(wheel);
    if (schedule) return { wheel, schedule };
  }
  return null;
}

// Everything the "At the studio" section says, for both calendar states.
export function toStudioSection(
  wheels: readonly StudioWheel[],
  hasEvents: boolean,
): StudioSection {
  const bookable = toBookableWheel(wheels);
  if (!bookable) {
    return {
      teaser: hasEvents
        ? null
        : {
            imageUrl: null,
            line: "Nothing is coming up on the calendar, and the wheels are resting for now. Write to us and we will tell you when they turn again.",
            hoursLabel: null,
            daysLabel: null,
            priceLabel: null,
            href: "/contact",
            linkLabel: "Write to us",
          },
    };
  }
  const { wheel, schedule } = bookable;
  const bookingHref = toWorkshopPath(wheel.slug);
  if (hasEvents) {
    return { bookingHref, note: toStudioNote(schedule), teaser: null };
  }
  return {
    bookingHref,
    teaser: {
      imageUrl: wheel.image_url,
      line: "Nothing is coming up on the calendar, but the wheels keep their usual hours. Pick a time and we will set one up for you.",
      hoursLabel: schedule.hoursLabel,
      daysLabel: schedule.daysLabel,
      priceLabel: schedule.priceLabel,
      href: bookingHref,
      linkLabel: "Book a wheel session",
    },
  };
}
