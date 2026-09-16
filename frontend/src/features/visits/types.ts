import type { StudioVisitAvailabilityQuery } from "@/graphql/generated/graphql";

export type VisitDayData =
  StudioVisitAvailabilityQuery["studioVisitAvailability"][number];
export type VisitWindowData = VisitDayData["windows"][number];

export const VISIT_DAYS = 14;

const DAY_LABEL = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  timeZone: "Asia/Kolkata",
});

const LONG_DAY = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Asia/Kolkata",
});

const WINDOW_TIME = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

// en-CA formats as YYYY-MM-DD, which is the key shape the API's calendar uses.
const DATE_KEY = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Kolkata",
});

export function toDateKey(instant: string): string {
  return DATE_KEY.format(new Date(instant));
}

// A date key is a wall-clock day in the studio's zone; noon keeps it on that day everywhere.
function atNoon(date: string): Date {
  return new Date(`${date}T12:00:00+05:30`);
}

export function toDayLabel(date: string): string {
  return DAY_LABEL.format(atNoon(date));
}

export function toDayNumber(date: string): string {
  return String(Number(date.slice(8, 10)));
}

export function toLongDayLabel(date: string): string {
  return LONG_DAY.format(atNoon(date));
}

export function toWindowLabel(startsAt: string, endsAt: string): string {
  const from = WINDOW_TIME.format(new Date(startsAt));
  const to = WINDOW_TIME.format(new Date(endsAt));
  const [fromTime, fromMeridiem] = from.split(" ");
  const [toTime, toMeridiem] = to.split(" ");
  // "12:00–12:30 pm" reads better than repeating the meridiem inside one window.
  return fromMeridiem === toMeridiem
    ? `${fromTime}–${toTime} ${toMeridiem}`
    : `${fromTime} ${fromMeridiem}–${toTime} ${toMeridiem}`;
}

// The first day that has a window left; nobody should have to hunt for it.
export function firstOpenDate(days: VisitDayData[]): string | null {
  return (
    days.find((day) => day.windows.some((window) => window.is_available))
      ?.date ?? null
  );
}

export function windowsFor(
  days: VisitDayData[],
  date: string | null,
): VisitWindowData[] {
  if (date === null) return [];
  return days.find((day) => day.date === date)?.windows ?? [];
}

export function countOpen(day: VisitDayData): number {
  return day.windows.filter((window) => window.is_available).length;
}

export function toConfirmationLine(
  name: string,
  startsAt: string,
  endsAt: string,
): string {
  const day = toLongDayLabel(toDateKey(startsAt));
  return `Thanks ${name}, we have you down for ${toWindowLabel(startsAt, endsAt)} on ${day}. Come to the gate and ring the bell.`;
}
