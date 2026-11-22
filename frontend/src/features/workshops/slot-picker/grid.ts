import type { CalendarDay } from "@/features/workshops/components/BookingCalendar";
import type { PickedSlot } from "@/features/workshops/components/PickedSlots";
import type { SlotOption } from "@/features/workshops/components/SlotList";
import {
  formatDateKey,
  formatHourRange,
  type SlotInterval,
  toDateKey,
  toSpanRule,
  type WorkshopDayData,
  type WorkshopSlotData,
} from "@/features/workshops/types";

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

export function isSlotPickable(
  slot: WorkshopSlotData,
  participants: number,
): boolean {
  return slot.is_available && slot.remaining >= participants;
}

export function pickableSlots(
  day: WorkshopDayData | undefined,
  participants: number,
): WorkshopSlotData[] {
  if (!day || day.is_closed) return [];
  return day.slots.filter((slot) => isSlotPickable(slot, participants));
}

function dayDelta(later: string, earlier: string): number {
  const [ly, lm, ld] = later.split("-").map(Number);
  const [ey, em, ed] = earlier.split("-").map(Number);
  return Math.round(
    (Date.UTC(ly ?? 0, (lm ?? 1) - 1, ld ?? 1) -
      Date.UTC(ey ?? 0, (em ?? 1) - 1, ed ?? 1)) /
      86_400_000,
  );
}

// Calendar days covered by a set of day keys, counting both ends.
export function spanDays(dateKeys: readonly string[]): number {
  if (dateKeys.length === 0) return 0;
  const sorted = [...dateKeys].sort();
  return dayDelta(sorted[sorted.length - 1] ?? "", sorted[0] ?? "") + 1;
}

export interface DateRange {
  from: string;
  days: number;
}

// The days holding picks outside the month on screen, so their capacity can be read too.
export function toOffMonthRange(
  pickedDateKeys: readonly string[],
  monthKey: string,
): DateRange | null {
  const offMonth = pickedDateKeys.filter((key) => toMonthKey(key) !== monthKey);
  const from = [...offMonth].sort()[0];
  return from ? { from, days: spanDays(offMonth) } : null;
}

// What the latest read said about a picked time: its slot, or null once a read of its day no longer has it.
export type PickReads = ReadonlyMap<string, WorkshopSlotData | null>;

function isSameRead(
  a: WorkshopSlotData | null | undefined,
  b: WorkshopSlotData | null | undefined,
): boolean {
  if (!a || !b) return a === b;
  return a.remaining === b.remaining && a.is_available === b.is_available;
}

// Folds fresh reads into what earlier reads said, so a month being read again does not forget a pick.
export function rememberPickReads(
  remembered: PickReads,
  picked: readonly SlotInterval[],
  freshDays: readonly WorkshopDayData[],
  timezone: string,
): PickReads {
  const freshDayKeys = new Set(freshDays.map((day) => day.date));
  const freshSlots = new Map(
    freshDays.flatMap((day) => day.slots).map((slot) => [slot.starts_at, slot]),
  );
  const next = new Map<string, WorkshopSlotData | null>();
  for (const pick of picked) {
    const isDayFresh = freshDayKeys.has(toDateKey(pick.starts_at, timezone));
    const read = isDayFresh
      ? (freshSlots.get(pick.starts_at) ?? null)
      : remembered.get(pick.starts_at);
    if (read !== undefined) next.set(pick.starts_at, read);
  }
  const isUnchanged =
    next.size === remembered.size &&
    [...next].every(
      ([start, read]) =>
        remembered.has(start) && isSameRead(read, remembered.get(start)),
    );
  return isUnchanged ? remembered : next;
}

// A pick stays while its time has room for the group; one never read stays for now, one read as gone leaves.
export function keepFittingPicks(
  picked: readonly SlotInterval[],
  reads: PickReads,
  participants: number,
): SlotInterval[] {
  return picked.filter((pick) => {
    const read = reads.get(pick.starts_at);
    if (read === undefined) return true;
    return read !== null && isSlotPickable(read, participants);
  });
}

// A day stays open while adding it keeps the whole set inside the allowed span.
export function isDayWithinSpan(
  dateKey: string,
  pickedDateKeys: string[],
  allowedSpanDays: number,
): boolean {
  if (pickedDateKeys.length === 0) return true;
  return spanDays([...pickedDateKeys, dateKey]) <= allowedSpanDays;
}

// Picked hours are always shown and sent in the order they happen, as "Sat 20 Sep · 3–4 pm".
export function toPickedSlots(
  picked: readonly SlotInterval[],
  timezone: string,
): PickedSlot[] {
  return [...picked]
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .map((slot) => ({
      startsAt: slot.starts_at,
      label: `${formatDateKey(toDateKey(slot.starts_at, timezone))} · ${formatHourRange(slot.starts_at, slot.ends_at, timezone)}`,
    }));
}

// Fills the session in layers: one hour on every free day in the window first, then a second
// hour on the earliest of them, and so on. Hours spread as thin as the window allows and only
// stack when they must. Null when the loaded days cannot hold them.
export function suggestSlots(
  days: readonly WorkshopDayData[],
  needed: number,
  participants: number,
  allowedSpanDays: number,
  todayKey: string,
): SlotInterval[] | null {
  if (needed <= 0) return [];
  const open = days
    .filter((day) => day.date >= todayKey)
    .map((day) => ({
      date: day.date,
      slots: [...pickableSlots(day, participants)].sort((a, b) =>
        a.starts_at.localeCompare(b.starts_at),
      ),
    }))
    .filter((day) => day.slots.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  for (let start = 0; start < open.length; start += 1) {
    const first = open[start];
    if (!first) break;
    const window = open
      .slice(start)
      .filter((day) => spanDays([first.date, day.date]) <= allowedSpanDays);
    const deepest = Math.max(...window.map((day) => day.slots.length));
    const picks: SlotInterval[] = [];
    for (let layer = 0; layer < deepest; layer += 1) {
      for (const day of window) {
        const slot = day.slots[layer];
        if (!slot) continue;
        picks.push({ starts_at: slot.starts_at, ends_at: slot.ends_at });
        if (picks.length === needed) {
          return picks.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
        }
      }
    }
  }
  return null;
}

// Tapping an hour adds or drops it; a full pick swaps its earliest hour for the new one.
export function togglePicked(
  picked: readonly SlotInterval[],
  slot: SlotInterval,
  needed: number,
): SlotInterval[] {
  if (picked.some((candidate) => candidate.starts_at === slot.starts_at)) {
    return picked.filter((candidate) => candidate.starts_at !== slot.starts_at);
  }
  const kept =
    picked.length >= needed
      ? [...picked]
          .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
          .slice(1)
      : picked;
  return [...kept, { starts_at: slot.starts_at, ends_at: slot.ends_at }];
}

// The days a new pick is measured against. A full pick drops its earliest time to make room
// (see togglePicked), so that day no longer holds the window; with one time needed none does.
export function toDaysKeptByNextPick(
  pickedDateKeys: readonly string[],
  timesNeeded: number,
): string[] {
  const sorted = [...pickedDateKeys].sort();
  return sorted.length >= timesNeeded ? sorted.slice(1) : sorted;
}

// Why a day cannot take the next pick, or null when it can. The day cells and the times under
// the selected day both ask this, so a day picked while in reach cannot keep offering its times
// once the picks change and it falls outside the window the API enforces.
export function toReachReason(
  dateKey: string,
  pickedDateKeys: readonly string[],
  timesNeeded: number,
  allowedSpanDays: number,
): string | null {
  const kept = toDaysKeptByNextPick(pickedDateKeys, timesNeeded);
  return isDayWithinSpan(dateKey, kept, allowedSpanDays)
    ? null
    : toSpanRule(allowedSpanDays);
}

export interface WeeksInput {
  monthKey: string;
  dayByKey: ReadonlyMap<string, WorkshopDayData>;
  participants: number;
  pickedDateKeys: string[];
  timesNeeded: number;
  allowedSpanDays: number;
  todayKey: string;
}

// A day the API sent nothing for is unknown, never closed; only a returned day can be closed.
export function toCalendarWeeks({
  monthKey,
  dayByKey,
  participants,
  pickedDateKeys,
  timesNeeded,
  allowedSpanDays,
  todayKey,
}: WeeksInput): (CalendarDay | null)[][] {
  return toMonthGrid(monthKey).map((week) =>
    week.map((dateKey) => {
      if (!dateKey) return null;
      const day = dayByKey.get(dateKey);
      const wheelsFree = pickableSlots(day, participants).reduce(
        (most, slot) => Math.max(most, slot.remaining),
        0,
      );
      return {
        dateKey,
        dayNumber: Number(dateKey.slice(8)),
        dayLabel: formatDateKey(dateKey),
        wheelsFree,
        pickedCount: pickedDateKeys.filter((key) => key === dateKey).length,
        isLoaded: day !== undefined,
        isClosed: day?.is_closed ?? false,
        closedKind: day?.closed_kind ?? null,
        isPast: dateKey < todayKey,
        mutedReason: toReachReason(
          dateKey,
          pickedDateKeys,
          timesNeeded,
          allowedSpanDays,
        ),
      };
    }),
  );
}

// Weeks already gone by push the open days down, so the month starts at the current week.
export function toVisibleWeeks(
  weeks: (CalendarDay | null)[][],
): (CalendarDay | null)[][] {
  const current = weeks.filter((week) =>
    week.some((day) => day !== null && !day.isPast),
  );
  return current.length > 0 ? current : weeks;
}

// A day out of reach keeps its picked times removable (SlotList never disables a picked one)
// but offers no new ones; the calendar notice says why, so the chip only says "Too far".
export function toSlotOptions(
  day: WorkshopDayData | undefined,
  participants: number,
  timezone: string,
  reachReason: string | null,
): SlotOption[] {
  return (day?.slots ?? []).map((slot) => {
    const isFree = isSlotPickable(slot, participants);
    return {
      startsAt: slot.starts_at,
      label: formatHourRange(slot.starts_at, slot.ends_at, timezone),
      wheelsFree: slot.remaining,
      isDisabled: !isFree || reachReason !== null,
      reason: !slot.is_available
        ? (slot.reason ?? "Not free")
        : !isFree
          ? "Not enough wheels"
          : reachReason
            ? "Too far"
            : null,
    };
  });
}
