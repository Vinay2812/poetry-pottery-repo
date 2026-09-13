// Pure scheduling maths for open-studio sessions; everything is expressed in the config's timezone.

export interface ScheduleConfig {
  timezone: string;
  opening_minutes: number;
  closing_minutes: number;
  slot_minutes: number;
  capacity_per_slot: number;
  booking_window_days: number;
  closed_weekdays: number[];
}

export interface Interval {
  starts_at: Date;
  ends_at: Date;
}

export interface Occupant extends Interval {
  participants: number;
}

export interface SlotAvailability {
  starts_at: Date;
  ends_at: Date;
  remaining: number;
  is_available: boolean;
  reason: string | null;
}

export interface DayAvailability {
  date: string;
  weekday: number;
  is_closed: boolean;
  reason: string | null;
  slots: SlotAvailability[];
}

const MINUTE = 60_000;
// Bookings need a little notice so someone is at the wheel to help.
export const MIN_LEAD_MINUTES = 120;

const partsCache = new Map<string, Intl.DateTimeFormat>();

function formatter(timezone: string): Intl.DateTimeFormat {
  let cached = partsCache.get(timezone);
  if (!cached) {
    cached = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    });
    partsCache.set(timezone, cached);
  }
  return cached;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface WallClock {
  date: string;
  weekday: number;
  minutes: number;
}

export function toWallClock(instant: Date, timezone: string): WallClock {
  const parts = Object.fromEntries(
    formatter(timezone)
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: WEEKDAYS.indexOf(parts.weekday ?? "Sun"),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

// The UTC instant for a wall-clock time in a zone; two passes absorb DST shifts.
export function fromWallClock(
  date: string,
  minutes: number,
  timezone: string,
): Date {
  const [year, month, day] = date.split("-").map(Number);
  let guess = Date.UTC(
    year ?? 1970,
    (month ?? 1) - 1,
    day ?? 1,
    Math.floor(minutes / 60),
    minutes % 60,
  );
  for (let pass = 0; pass < 2; pass += 1) {
    const wall = toWallClock(new Date(guess), timezone);
    const wallUtc =
      Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, 0, 0) +
      wall.minutes * MINUTE +
      dayDelta(wall.date, date) * 86_400_000;
    const target =
      Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, 0, 0) +
      minutes * MINUTE;
    guess += target - wallUtc;
  }
  return new Date(guess);
}

function dayDelta(actual: string, expected: string): number {
  const [ay, am, ad] = actual.split("-").map(Number);
  const [ey, em, ed] = expected.split("-").map(Number);
  return Math.round(
    (Date.UTC(ay ?? 0, (am ?? 1) - 1, ad ?? 1) -
      Date.UTC(ey ?? 0, (em ?? 1) - 1, ed ?? 1)) /
      86_400_000,
  );
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(
    Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + days),
  );
  return next.toISOString().slice(0, 10);
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.starts_at < b.ends_at && a.ends_at > b.starts_at;
}

// Seats already taken in a slot are the participants of every active booking that touches it.
export function occupancy(slot: Interval, occupants: Occupant[]): number {
  return occupants
    .filter((occupant) => overlaps(slot, occupant))
    .reduce((sum, occupant) => sum + occupant.participants, 0);
}

export function slotStartsForDay(date: string, config: ScheduleConfig): Date[] {
  const starts: Date[] = [];
  for (
    let minutes = config.opening_minutes;
    minutes + config.slot_minutes <= config.closing_minutes;
    minutes += config.slot_minutes
  ) {
    starts.push(fromWallClock(date, minutes, config.timezone));
  }
  return starts;
}

export interface AvailabilityInput {
  config: ScheduleConfig;
  from: string;
  days: number;
  now: Date;
  blackouts: (Interval & { reason: string | null })[];
  occupants: Occupant[];
}

export function buildAvailability({
  config,
  from,
  days,
  now,
  blackouts,
  occupants,
}: AvailabilityInput): DayAvailability[] {
  const today = toWallClock(now, config.timezone).date;
  const lastDay = addDays(today, config.booking_window_days);
  const earliest = new Date(now.getTime() + MIN_LEAD_MINUTES * MINUTE);
  const result: DayAvailability[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = addDays(from, offset);
    const weekday = toWallClock(
      fromWallClock(date, config.opening_minutes, config.timezone),
      config.timezone,
    ).weekday;
    if (date < today) {
      result.push({
        date,
        weekday,
        is_closed: true,
        reason: "Past",
        slots: [],
      });
      continue;
    }
    if (date > lastDay) {
      result.push({
        date,
        weekday,
        is_closed: true,
        reason: `Bookings open ${config.booking_window_days} days ahead`,
        slots: [],
      });
      continue;
    }
    if (config.closed_weekdays.includes(weekday)) {
      result.push({
        date,
        weekday,
        is_closed: true,
        reason: "Studio closed",
        slots: [],
      });
      continue;
    }
    const slots = slotStartsForDay(date, config).map(
      (starts_at): SlotAvailability => {
        const slot = {
          starts_at,
          ends_at: new Date(starts_at.getTime() + config.slot_minutes * MINUTE),
        };
        const blackout = blackouts.find((candidate) =>
          overlaps(slot, candidate),
        );
        const remaining = Math.max(
          0,
          config.capacity_per_slot - occupancy(slot, occupants),
        );
        if (starts_at < earliest)
          return {
            ...slot,
            remaining,
            is_available: false,
            reason: "Too soon",
          };
        if (blackout)
          return {
            ...slot,
            remaining,
            is_available: false,
            reason: blackout.reason ?? "Studio closed",
          };
        if (remaining === 0)
          return {
            ...slot,
            remaining,
            is_available: false,
            reason: "Fully booked",
          };
        return { ...slot, remaining, is_available: true, reason: null };
      },
    );
    const isClosed = slots.every((slot) => !slot.is_available);
    result.push({
      date,
      weekday,
      is_closed: isClosed,
      reason: isClosed ? "No sessions left" : null,
      slots,
    });
  }
  return result;
}

export type SessionCheck = { ok: true } | { ok: false; reason: string };

// Validates a requested session against the same rules the calendar shows.
export function checkSession(
  session: Interval & { participants: number },
  config: ScheduleConfig,
  now: Date,
  blackouts: (Interval & { reason: string | null })[],
  occupants: Occupant[],
): SessionCheck {
  const start = toWallClock(session.starts_at, config.timezone);
  const end = toWallClock(session.ends_at, config.timezone);
  const today = toWallClock(now, config.timezone).date;
  if (
    session.participants < 1 ||
    session.participants > config.capacity_per_slot
  ) {
    return {
      ok: false,
      reason: `Sessions take 1 to ${config.capacity_per_slot} people`,
    };
  }
  if (session.starts_at < new Date(now.getTime() + MIN_LEAD_MINUTES * MINUTE)) {
    return {
      ok: false,
      reason: `Book at least ${MIN_LEAD_MINUTES / 60} hours ahead`,
    };
  }
  if (start.date > addDays(today, config.booking_window_days)) {
    return {
      ok: false,
      reason: `Bookings open ${config.booking_window_days} days ahead`,
    };
  }
  if (config.closed_weekdays.includes(start.weekday)) {
    return { ok: false, reason: "The studio is closed that day" };
  }
  if (
    start.date !== end.date ||
    (start.minutes - config.opening_minutes) % config.slot_minutes !== 0
  ) {
    return { ok: false, reason: "Choose a session from the calendar" };
  }
  if (
    start.minutes < config.opening_minutes ||
    end.minutes > config.closing_minutes
  ) {
    return { ok: false, reason: "That time is outside studio hours" };
  }
  const blackout = blackouts.find((candidate) => overlaps(session, candidate));
  if (blackout) {
    return {
      ok: false,
      reason: blackout.reason ?? "The studio is closed then",
    };
  }
  for (const starts_at of slotStartsForDay(start.date, config)) {
    const slot = {
      starts_at,
      ends_at: new Date(starts_at.getTime() + config.slot_minutes * MINUTE),
    };
    if (!overlaps(slot, session)) continue;
    if (
      occupancy(slot, occupants) + session.participants >
      config.capacity_per_slot
    ) {
      return { ok: false, reason: "Not enough wheels free for that session" };
    }
  }
  return { ok: true };
}
