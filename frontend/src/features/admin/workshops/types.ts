import {
  type AdminWorkshopBlackoutFieldsFragment,
  type AdminWorkshopBookingRowFragment,
  type AdminWorkshopConfigFieldsFragment,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import { safeTimeZone } from "@/lib/timezones";

export type WorkshopConfigData = AdminWorkshopConfigFieldsFragment;
export type WorkshopTierData = WorkshopConfigData["tiers"][number];
export type WorkshopBlackoutData = AdminWorkshopBlackoutFieldsFragment;
export type WorkshopBookingData = AdminWorkshopBookingRowFragment;

export const BOOKINGS_PAGE_SIZE = 20;

/** Weekday numbers match JavaScript's Date#getDay, so 0 is Sunday. */
export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function weekdayLabel(weekday: number): string {
  return WEEKDAY_LABELS[weekday] ?? "";
}

export function weekdayNumber(label: string): number {
  return WEEKDAY_LABELS.indexOf(label);
}

export function toWeekdayLabels(weekdays: number[]): string[] {
  return [...weekdays]
    .filter((weekday) => weekday >= 0 && weekday < WEEKDAY_LABELS.length)
    .sort((a, b) => a - b)
    .map(weekdayLabel);
}

export function toWeekdayNumbers(labels: string[]): number[] {
  return labels
    .map(weekdayNumber)
    .filter((weekday) => weekday !== -1)
    .sort((a, b) => a - b);
}

export function toggleWeekday(weekdays: number[], weekday: number): number[] {
  if (weekdays.includes(weekday)) {
    return weekdays.filter((candidate) => candidate !== weekday);
  }
  return [...weekdays, weekday].sort((a, b) => a - b);
}

export function describeClosedDays(weekdays: number[]): string {
  const labels = toWeekdayLabels(weekdays);
  if (labels.length === 0) return "Open every day";
  return `Closed on ${labels.join(", ")}`;
}

/** Opening and closing times are stored as minutes past midnight: 540 is 09:00. */
export function minutesToTimeInput(minutes: number): string {
  const clamped = Math.max(0, Math.min(minutes, 24 * 60));
  const hours = Math.floor(clamped / 60);
  const rest = clamped % 60;
  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function timeInputToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return 0;
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

// Every zone-aware helper funnels through here, so a junk zone degrades rather than throws.
function readWallClock(instant: Date, timezone: string): WallClock {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: safeTimeZone(timezone),
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    // A midnight wall clock reads as hour 24 in some locales.
    hour: read("hour") % 24,
    minute: read("minute"),
  };
}

function zoneOffsetMs(instant: Date, timezone: string): number {
  const clock = readWallClock(instant, timezone);
  const asUtc = Date.UTC(
    clock.year,
    clock.month - 1,
    clock.day,
    clock.hour,
    clock.minute,
  );
  const trimmed = Math.floor(instant.getTime() / 60_000) * 60_000;
  return asUtc - trimmed;
}

/** An instant rendered as the studio's wall clock, the shape datetime-local wants. */
export function toDateTimeLocal(instant: string, timezone: string): string {
  if (!instant) return "";
  const clock = readWallClock(new Date(instant), timezone);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${clock.year}-${pad(clock.month)}-${pad(clock.day)}T${pad(clock.hour)}:${pad(clock.minute)}`;
}

/** The reverse: a wall clock in the studio's timezone back to an instant. */
export function fromDateTimeLocal(value: string, timezone: string): string {
  if (!value) return "";
  const naive = Date.parse(`${value}:00.000Z`);
  if (Number.isNaN(naive)) return "";
  // One pass lands on the right offset, a second settles days that change it.
  let guess = naive - zoneOffsetMs(new Date(naive), timezone);
  guess = naive - zoneOffsetMs(new Date(guess), timezone);
  return new Date(guess).toISOString();
}

function shiftDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const shifted = new Date(
    Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + days),
  );
  return shifted.toISOString().slice(0, 10);
}

/** A YYYY-MM-DD filter starts at the first instant of that studio day. */
export function toRangeStart(dateKey: string, timezone: string): string {
  if (!dateKey) return "";
  return fromDateTimeLocal(`${dateKey}T00:00`, timezone);
}

/** The "to" end covers the whole day, right up to the moment the next one begins. */
export function toRangeEnd(dateKey: string, timezone: string): string {
  if (!dateKey) return "";
  const nextDay = fromDateTimeLocal(
    `${shiftDateKey(dateKey, 1)}T00:00`,
    timezone,
  );
  if (!nextDay) return "";
  return new Date(Date.parse(nextDay) - 1).toISOString();
}

export function formatHoursLabel(hours: number): string {
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

export function formatParticipantsLabel(participants: number): string {
  return `${participants} ${participants === 1 ? "person" : "people"}`;
}

/** One line for a session: the day once, then both clock times. */
export function describeSession(startsAt: string, endsAt: string): string {
  const from = formatDateTime(startsAt);
  if (formatDate(startsAt) === formatDate(endsAt)) {
    return `${from} → ${formatTime(endsAt)}`;
  }
  return `${from} → ${formatDateTime(endsAt)}`;
}

export interface WorkshopConfigPatch {
  id: number;
  changes: Partial<WorkshopConfigData>;
}

export function applyConfigPatch(
  configs: WorkshopConfigData[],
  patch: WorkshopConfigPatch,
): WorkshopConfigData[] {
  return configs.map((config) =>
    config.id === patch.id ? { ...config, ...patch.changes } : config,
  );
}

export interface WorkshopTierPatch {
  kind: "save" | "remove";
  tier: WorkshopTierData;
}

/** Tiers are keyed by hours, so saving an existing length replaces it in place. */
export function applyTierPatch(
  tiers: WorkshopTierData[],
  patch: WorkshopTierPatch,
): WorkshopTierData[] {
  if (patch.kind === "remove") {
    return tiers.filter((tier) => tier.id !== patch.tier.id);
  }
  const exists = tiers.some((tier) => tier.hours === patch.tier.hours);
  const next = exists
    ? tiers.map((tier) =>
        tier.hours === patch.tier.hours ? { ...tier, ...patch.tier } : tier,
      )
    : [...tiers, patch.tier];
  return next.sort((a, b) => a.hours - b.hours);
}

export interface WorkshopBlackoutPatch {
  kind: "save" | "remove";
  blackout: WorkshopBlackoutData;
}

export function applyBlackoutPatch(
  blackouts: WorkshopBlackoutData[],
  patch: WorkshopBlackoutPatch,
): WorkshopBlackoutData[] {
  if (patch.kind === "remove") {
    return blackouts.filter((entry) => entry.id !== patch.blackout.id);
  }
  // A draft (id 0) whose saved row has already been read back is matched by its span instead.
  const isSame = (entry: WorkshopBlackoutData) =>
    entry.id === patch.blackout.id ||
    (patch.blackout.id === 0 &&
      entry.starts_at === patch.blackout.starts_at &&
      entry.ends_at === patch.blackout.ends_at);
  const next = blackouts.some(isSame)
    ? blackouts.map((entry) =>
        isSame(entry) ? { ...entry, ...patch.blackout, id: entry.id } : entry,
      )
    : [...blackouts, patch.blackout];
  return next.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export interface WorkshopBookingStatusPatch {
  id: string;
  status: RegistrationStatus;
}

/**
 * The optimistic baseline for the bookings list: the row shows its new status at
 * once and drops its actions until the server says which ones are left.
 */
export function applyBookingStatus(
  rows: WorkshopBookingData[],
  patch: WorkshopBookingStatusPatch,
): WorkshopBookingData[] {
  return rows.map((row) => {
    if (row.booking.id !== patch.id) return row;
    return {
      ...row,
      next_statuses: [],
      booking: { ...row.booking, status: patch.status },
    };
  });
}
