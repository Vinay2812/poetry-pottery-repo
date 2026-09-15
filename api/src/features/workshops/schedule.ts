// Pure scheduling maths for open-studio sessions; everything is expressed in the config's timezone.

export interface ScheduleConfig {
  timezone: string;
  opening_minutes: number;
  closing_minutes: number;
  slot_minutes: number;
  capacity_per_slot: number;
  booking_window_days: number;
  slot_span_days: number;
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

// Whole calendar days from `expected` to `actual`, signed.
export function dayDelta(actual: string, expected: string): number {
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

export interface SlotRequest {
  slot_starts: Date[];
  participants: number;
  hours: number;
}

export function slotsPerBooking(
  hours: number,
  config: Pick<ScheduleConfig, "slot_minutes">,
): number {
  return Math.max(1, Math.round((hours * 60) / config.slot_minutes));
}

// Calendar days covered by a set of instants, counting both ends.
export function spanDays(starts: Date[], timezone: string): number {
  if (starts.length === 0) return 0;
  const dates = starts.map((start) => toWallClock(start, timezone).date).sort();
  return dayDelta(dates[dates.length - 1] ?? "", dates[0] ?? "") + 1;
}

// Validates one chosen hour against the same rules the calendar shows.
function checkSlot(
  starts_at: Date,
  config: ScheduleConfig,
  now: Date,
  blackouts: (Interval & { reason: string | null })[],
): SessionCheck {
  const slot = {
    starts_at,
    ends_at: new Date(starts_at.getTime() + config.slot_minutes * MINUTE),
  };
  const start = toWallClock(slot.starts_at, config.timezone);
  const end = toWallClock(slot.ends_at, config.timezone);
  const today = toWallClock(now, config.timezone).date;
  if (slot.starts_at < new Date(now.getTime() + MIN_LEAD_MINUTES * MINUTE)) {
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
    starts_at.getUTCSeconds() !== 0 ||
    starts_at.getUTCMilliseconds() !== 0 ||
    (start.date !== end.date && end.minutes !== 0) ||
    (start.minutes - config.opening_minutes) % config.slot_minutes !== 0
  ) {
    return { ok: false, reason: "Choose an hour from the calendar" };
  }
  if (
    start.minutes < config.opening_minutes ||
    start.minutes + config.slot_minutes > config.closing_minutes
  ) {
    return { ok: false, reason: "That time is outside studio hours" };
  }
  const blackout = blackouts.find((candidate) => overlaps(slot, candidate));
  if (blackout) {
    return {
      ok: false,
      reason: blackout.reason ?? "The studio is closed then",
    };
  }
  return { ok: true };
}

// Validates a whole booking: the right number of hours, each one open, all within the allowed span.
export function checkSlots(
  request: SlotRequest,
  config: ScheduleConfig,
  now: Date,
  blackouts: (Interval & { reason: string | null })[],
  occupants: Occupant[],
): SessionCheck {
  const needed = slotsPerBooking(request.hours, config);
  if (
    request.participants < 1 ||
    request.participants > config.capacity_per_slot
  ) {
    return {
      ok: false,
      reason: `Sessions take 1 to ${config.capacity_per_slot} people`,
    };
  }
  if (request.slot_starts.length !== needed) {
    return {
      ok: false,
      reason: `Pick ${needed} ${needed === 1 ? "hour" : "hours"} for a ${request.hours} hour session`,
    };
  }
  const times = new Set(request.slot_starts.map((start) => start.getTime()));
  if (times.size !== request.slot_starts.length) {
    return { ok: false, reason: "You picked the same hour twice" };
  }
  for (const starts_at of request.slot_starts) {
    const check = checkSlot(starts_at, config, now, blackouts);
    if (!check.ok) return check;
  }
  if (spanDays(request.slot_starts, config.timezone) > config.slot_span_days) {
    return {
      ok: false,
      reason:
        config.slot_span_days === 1
          ? "Keep every hour on the same day"
          : `Keep every hour within ${config.slot_span_days} days of the first`,
    };
  }
  for (const starts_at of request.slot_starts) {
    const slot = {
      starts_at,
      ends_at: new Date(starts_at.getTime() + config.slot_minutes * MINUTE),
    };
    if (
      occupancy(slot, occupants) + request.participants >
      config.capacity_per_slot
    ) {
      return {
        ok: false,
        reason: "Not enough wheels free for one of those hours",
      };
    }
  }
  return { ok: true };
}

// The first start and last end of a booking, used for listing and sorting.
export function slotBounds(starts: Date[], slotMinutes: number): Interval {
  const sorted = [...starts].sort((a, b) => a.getTime() - b.getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) throw new Error("A booking needs at least one hour");
  return {
    starts_at: first,
    ends_at: new Date(last.getTime() + slotMinutes * MINUTE),
  };
}
