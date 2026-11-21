import type { WorkshopsQuery } from "@/graphql/generated/graphql";
import { formatInr } from "@/lib/format";

export type StudioWheel = Pick<
  WorkshopsQuery["workshops"][number],
  "opening_minutes" | "closing_minutes" | "closed_weekdays" | "tiers"
>;

export interface StudioSchedule {
  hoursLabel: string;
  daysLabel: string;
  offer: string | null;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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
  const closed = new Set(
    closedWeekdays.filter((day) => day >= 0 && day < WEEKDAYS.length),
  );
  const open = WEEKDAYS.filter((_, day) => !closed.has(day));
  if (open.length === 0) return null;
  if (closed.size === 0) return "Every day";
  // Name whichever list is shorter.
  if (open.length < closed.size) {
    return `${joinWords(open.map((day) => `${day}s`))} only`;
  }
  const closedNames = WEEKDAYS.filter((_, day) => closed.has(day));
  return `Every day except ${joinWords(closedNames)}`;
}

// The cheapest way onto a wheel, read off the shortest tier.
export function toStudioPriceLabel(tiers: StudioWheel["tiers"]): string | null {
  const shortest = [...tiers].sort((a, b) => a.hours - b.hours)[0];
  if (!shortest) return null;
  const hours = shortest.hours === 1 ? "an hour" : `${shortest.hours} hours`;
  return `From ${formatInr(shortest.price_per_person)} a person for ${hours}`;
}

// How long someone can book, said only as far as the tiers allow.
export function toStudioOffer(tiers: StudioWheel["tiers"]): string | null {
  const hours = [...new Set(tiers.map((tier) => tier.hours))].sort(
    (a, b) => a - b,
  );
  const shortest = hours[0];
  const longest = hours[hours.length - 1];
  if (shortest === undefined || longest === undefined) return null;
  const first = shortest === 1 ? "an hour" : `${toNumberWord(shortest)} hours`;
  if (hours.length === 1) return `Book ${first}.`;
  if (shortest === 1 && longest === 3) return "Book an hour or three.";
  return `Book ${first} or more.`;
}

// Hours and days come only from a wheel with at least one open day.
export function toStudioSchedule(
  wheel: StudioWheel | null,
): StudioSchedule | null {
  if (!wheel) return null;
  const daysLabel = toStudioDaysLabel(wheel.closed_weekdays);
  if (!daysLabel) return null;
  return {
    hoursLabel: toStudioHoursLabel(
      wheel.opening_minutes,
      wheel.closing_minutes,
    ),
    daysLabel,
    offer: toStudioOffer(wheel.tiers),
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
  const runs = `Wheel sessions run ${schedule.hoursLabel}, ${toMidSentence(schedule.daysLabel)}.`;
  return schedule.offer ? `${runs} ${schedule.offer}` : runs;
}
