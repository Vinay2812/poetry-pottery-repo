import {
  type AdminWorkshopBlackoutFieldsFragment,
  type AdminWorkshopBookingRowFragment,
  type AdminWorkshopConfigFieldsFragment,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import { formatShortDay } from "@/lib/format";
import { safeTimeZone } from "@/lib/timezones";

import type { QueryPatch } from "@/features/admin/shell/types";

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

export interface SessionSlot {
  starts_at: string;
  ends_at: string;
}

interface ClockReading {
  time: string;
  period: string;
}

// Read from parts, never by splitting text: ICU may put a narrow no-break space before "pm".
function readClock(instant: string, timezone: string): ClockReading {
  const parts = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).formatToParts(new Date(instant));
  const read = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  const minute = read("minute");
  return {
    time: minute === "00" ? read("hour") : `${read("hour")}:${minute}`,
    period: read("dayPeriod").toLowerCase(),
  };
}

// "3–5 pm" when both ends share a meridiem, "11 am–1 pm" when they do not.
function formatClockRange(slot: SessionSlot, timezone: string): string {
  const from = readClock(slot.starts_at, timezone);
  const to = readClock(slot.ends_at, timezone);
  if (from.period === to.period) return `${from.time}–${to.time} ${to.period}`;
  return `${from.time} ${from.period}–${to.time} ${to.period}`;
}

/** Back-to-back hours read as one stretch, so 3–4 and 4–5 become 3–5. */
function joinBackToBack(slots: SessionSlot[]): SessionSlot[] {
  const sorted = [...slots].sort((a, b) =>
    a.starts_at.localeCompare(b.starts_at),
  );
  return sorted.reduce<SessionSlot[]>((runs, slot) => {
    const last = runs[runs.length - 1];
    if (last && Date.parse(last.ends_at) === Date.parse(slot.starts_at)) {
      return [...runs.slice(0, -1), { ...last, ends_at: slot.ends_at }];
    }
    return [...runs, slot];
  }, []);
}

/**
 * A booking can be split across days, so each day gets its own line:
 * "Wed 25 Nov · 3–4 pm" then "Sat 28 Nov · 4–5 pm".
 */
export function describeSessionDays(
  slots: SessionSlot[],
  timezone: string,
): string[] {
  const zone = safeTimeZone(timezone);
  const days = new Map<string, string[]>();
  for (const run of joinBackToBack(slots)) {
    const day = formatShortDay(run.starts_at, zone);
    days.set(day, [...(days.get(day) ?? []), formatClockRange(run, zone)]);
  }
  return [...days.entries()].map(
    ([day, times]) => `${day} · ${times.join(", ")}`,
  );
}

export function describeSessionSize(
  hours: number,
  participants: number,
): string {
  return `${formatHoursLabel(hours)} · ${formatParticipantsLabel(participants)}`;
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
  // The reason typed when turning down or cancelling, shown at once.
  reason: string | null;
}

/**
 * The optimistic baseline for the bookings list: the row shows its new status and
 * reason at once and drops its actions until the server says which ones are left.
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
      booking: {
        ...row.booking,
        status: patch.status,
        cancel_reason: patch.reason ?? row.booking.cancel_reason,
      },
    };
  });
}

// The request queue can span every setup; settings, sessions and closed days are always one setup's.
export const ALL_SETUPS = "all";

export type SetupChoice = { kind: "all" } | { kind: "one"; id: number };

// "all" only means something with two or more setups; an unknown id falls back to the first setup.
export function readSetupChoice(
  configIds: readonly number[],
  wanted: string | undefined,
): SetupChoice | null {
  const first = configIds[0];
  if (first === undefined) return null;
  if (wanted === ALL_SETUPS && configIds.length > 1) return { kind: "all" };
  const id = configIds.find((configId) => String(configId) === wanted);
  return { kind: "one", id: id ?? first };
}

// The picker leads with the whole queue when there is more than one setup to span.
export function toSetupOptions(
  configs: readonly { id: number; name: string }[],
): { value: string; label: string }[] {
  const setups = configs.map((config) => ({
    value: String(config.id),
    label: config.name,
  }));
  return setups.length > 1
    ? [{ value: ALL_SETUPS, label: "All setups" }, ...setups]
    : setups;
}

// Links into the wheel list from elsewhere span every setup, since the counts behind them do.
export function toWheelSessionsHref(
  filters: Readonly<Record<string, string>> = {},
): string {
  const query = new URLSearchParams(filters);
  query.set("config", ALL_SETUPS);
  query.sort();
  return `/dashboard/workshops?${query.toString()}`;
}

// "Waiting on you" only ever holds requests still awaiting approval, so another status turns it off.
export function toStatusFilterPatch(status: string): QueryPatch {
  const isOtherStatus = status !== "" && status !== RegistrationStatus.Pending;
  return isOtherStatus
    ? { status, awaiting: null }
    : { status: status || null };
}

// Turning the queue on drops a status it could never match.
export function toAwaitingFilterPatch(
  awaiting: string,
  status: string,
): QueryPatch {
  const clashes =
    awaiting !== "" && status !== "" && status !== RegistrationStatus.Pending;
  return clashes ? { awaiting, status: null } : { awaiting: awaiting || null };
}
