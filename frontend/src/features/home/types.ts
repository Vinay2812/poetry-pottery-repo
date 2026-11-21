import { formatInr } from "@/lib/format";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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

// Weekday numbers follow Date#getDay, so 0 is Sunday.
export function toStudioDaysLabel(closedWeekdays: readonly number[]): string {
  const closed = [...new Set(closedWeekdays)]
    .filter((day) => day >= 0 && day < WEEKDAYS.length)
    .sort((a, b) => a - b)
    .map((day) => WEEKDAYS[day] ?? "");
  if (closed.length === 0) return "Every day";
  if (closed.length === 1) return `Every day but ${closed[0]}`;
  if (closed.length >= WEEKDAYS.length - 1) {
    const open = WEEKDAYS.filter((day) => !closed.includes(day));
    return open.length === 1 ? `${open[0]}s only` : "By appointment";
  }
  return `Closed ${closed.slice(0, -1).join(", ")} and ${closed[closed.length - 1]}`;
}

// The cheapest way onto a wheel, read off the shortest tier.
export function toStudioPriceLabel(
  tiers: readonly { hours: number; price_per_person: number }[],
): string | null {
  const shortest = [...tiers].sort((a, b) => a.hours - b.hours)[0];
  if (!shortest) return null;
  const hours = shortest.hours === 1 ? "an hour" : `${shortest.hours} hours`;
  return `From ${formatInr(shortest.price_per_person)} a person for ${hours}`;
}

export interface StudioWheel {
  opening_minutes: number;
  closing_minutes: number;
  closed_weekdays: readonly number[];
  tiers: readonly { hours: number; price_per_person: number }[];
}

export interface StudioFacts {
  hoursLabel: string;
  daysLabel: string;
  priceLabel: string | null;
}

// Without a wheel on the books the teaser still speaks in the studio's usual hours.
export function toStudioFacts(wheel: StudioWheel | null): StudioFacts {
  if (!wheel) {
    return {
      hoursLabel: "Afternoons",
      daysLabel: "Every day but Monday",
      priceLabel: null,
    };
  }
  return {
    hoursLabel: toStudioHoursLabel(
      wheel.opening_minutes,
      wheel.closing_minutes,
    ),
    daysLabel: toStudioDaysLabel(wheel.closed_weekdays),
    priceLabel: toStudioPriceLabel(wheel.tiers),
  };
}

// Mid-sentence the days read lower case, but a weekday keeps its capital.
function toMidSentence(label: string): string {
  return /^(Every|Closed|By)\b/.test(label)
    ? `${label.charAt(0).toLowerCase()}${label.slice(1)}`
    : label;
}

// The line under "At the studio", read off the wheel's own hours when it has them.
export function toStudioNote(wheel: StudioWheel | null): string {
  if (!wheel) {
    return "Wheel sessions run every afternoon except Monday. Book an hour or three.";
  }
  const { hoursLabel, daysLabel } = toStudioFacts(wheel);
  return `Wheel sessions run ${hoursLabel}, ${toMidSentence(daysLabel)}. Book an hour or three.`;
}
