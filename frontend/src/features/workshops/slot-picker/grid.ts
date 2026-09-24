import type { CalendarDay } from "@/features/workshops/components/BookingCalendar";
import type { PickedSlot } from "@/features/workshops/components/PickedSlots";
import type { SlotOption } from "@/features/workshops/components/SlotList";
import {
  formatDateKey,
  formatHourRange,
  type SlotInterval,
  toDateKey,
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

// Hours are picked one slot at a time, so a booking needs this many of them.
export function slotsNeeded(hours: number, slotMinutes: number): number {
  // Matches the API's slotsPerBooking, which rounds up so a session never runs short.
  return Math.max(1, Math.ceil((hours * 60) / slotMinutes));
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
export function spanDays(dateKeys: string[]): number {
  if (dateKeys.length === 0) return 0;
  const sorted = [...dateKeys].sort();
  return dayDelta(sorted[sorted.length - 1] ?? "", sorted[0] ?? "") + 1;
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

export function spanNotice(allowedSpanDays: number): string {
  return allowedSpanDays === 1
    ? "Pick every hour on the same day"
    : `Pick within ${allowedSpanDays} days of your first slot`;
}

// Picked hours are always shown and sent in the order they happen, as "Sat, 20 Sept · 3–4 pm".
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

export function isSameSelection(
  picked: readonly SlotInterval[],
  current: readonly SlotInterval[],
): boolean {
  if (picked.length !== current.length) return false;
  const pickedStarts = picked.map((slot) => slot.starts_at).sort();
  const currentStarts = current.map((slot) => slot.starts_at).sort();
  return pickedStarts.every((start, index) => start === currentStarts[index]);
}

export interface WeeksInput {
  monthKey: string;
  dayByKey: ReadonlyMap<string, WorkshopDayData>;
  participants: number;
  pickedDateKeys: string[];
  allowedSpanDays: number;
  todayKey: string;
}

// A day nobody has loaded reads as closed, so callers show a skeleton until the month arrives.
export function toCalendarWeeks({
  monthKey,
  dayByKey,
  participants,
  pickedDateKeys,
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
        isClosed: day?.is_closed ?? true,
        closedKind: day?.closed_kind ?? null,
        isPast: dateKey < todayKey,
        mutedReason: isDayWithinSpan(dateKey, pickedDateKeys, allowedSpanDays)
          ? null
          : spanNotice(allowedSpanDays),
      };
    }),
  );
}

export function toSlotOptions(
  day: WorkshopDayData | undefined,
  participants: number,
  timezone: string,
): SlotOption[] {
  return (day?.slots ?? []).map((slot) => ({
    startsAt: slot.starts_at,
    label: formatHourRange(slot.starts_at, slot.ends_at, timezone),
    wheelsFree: slot.remaining,
    isDisabled: !isSlotPickable(slot, participants),
    reason: slot.is_available
      ? "Not enough wheels"
      : (slot.reason ?? "Not free"),
  }));
}
