import { describe, expect, it } from "vitest";

import {
  daysInMonth,
  formatDayRange,
  formatDateKey,
  formatHourRange,
  formatPickedProgress,
  formatSlotLine,
  groupSlotsByDay,
  isDayWithinSpan,
  isSlotPickable,
  pickableSlots,
  pickTier,
  quoteSession,
  shiftMonth,
  slotsNeeded,
  spanDays,
  spanNotice,
  toBookingWhenLines,
  toDateKey,
  togglePicked,
  toMonthGrid,
  toPickedSlots,
  toWhatsAppSessionMessage,
  type WorkshopDayData,
} from "./types";

const IST = "Asia/Kolkata";

const tiers = [
  { hours: 1, price_per_person: 950, pieces_per_person: 1 },
  { hours: 2, price_per_person: 1700, pieces_per_person: 2 },
];

function slot(hour: number, remaining: number, available = true) {
  const starts = new Date(Date.UTC(2026, 8, 13, hour - 5, 30));
  const ends = new Date(starts.getTime() + 3_600_000);
  return {
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    remaining,
    is_available: available,
    reason: available ? null : "Fully booked",
  };
}

describe("calendar helpers", () => {
  it("keys dates in the studio timezone", () => {
    expect(toDateKey("2026-09-12T20:30:00.000Z", "Asia/Kolkata")).toBe(
      "2026-09-13",
    );
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(daysInMonth("2026-02")).toBe(28);
    expect(formatDateKey("2026-09-13")).toBe("Sun, 13 Sept");
  });

  it("builds a Monday-first grid", () => {
    const grid = toMonthGrid("2026-09");
    expect(grid[0]).toEqual([
      null,
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-05",
      "2026-09-06",
    ]);
    expect(grid.at(-1)?.at(2)).toBe("2026-09-30");
    expect(grid.every((week) => week.length === 7)).toBe(true);
  });
});

describe("session helpers", () => {
  const day: WorkshopDayData = {
    date: "2026-09-13",
    weekday: 0,
    is_closed: false,
    reason: null,
    slots: [slot(13, 6), slot(14, 2), slot(15, 0, false), slot(16, 6)],
  };

  it("prices from the tier", () => {
    expect(pickTier(tiers, 2)?.price_per_person).toBe(1700);
    expect(quoteSession(pickTier(tiers, 2), 3)).toEqual({
      subtotal: 5100,
      pieces: 6,
    });
    expect(quoteSession(null, 3)).toEqual({ subtotal: 0, pieces: 0 });
  });

  it("offers only the hours with room for the whole group", () => {
    expect(slotsNeeded(3, 60)).toBe(3);
    expect(isSlotPickable(day.slots[0]!, 6)).toBe(true);
    expect(isSlotPickable(day.slots[1]!, 3)).toBe(false);
    expect(isSlotPickable(day.slots[2]!, 1)).toBe(false);
    expect(pickableSlots(day, 2).map((s) => s.starts_at)).toEqual([
      day.slots[0]?.starts_at,
      day.slots[1]?.starts_at,
      day.slots[3]?.starts_at,
    ]);
    expect(pickableSlots({ ...day, is_closed: true }, 1)).toEqual([]);
  });

  it("keeps the picked hours inside the allowed span", () => {
    expect(spanDays([])).toBe(0);
    expect(spanDays(["2026-09-13"])).toBe(1);
    expect(spanDays(["2026-09-20", "2026-09-13", "2026-09-15"])).toBe(8);
    expect(isDayWithinSpan("2026-09-19", [], 7)).toBe(true);
    expect(isDayWithinSpan("2026-09-19", ["2026-09-13"], 7)).toBe(true);
    expect(isDayWithinSpan("2026-09-20", ["2026-09-13"], 7)).toBe(false);
    expect(spanNotice(7)).toBe("Pick within 7 days of your first slot");
    expect(spanNotice(1)).toBe("Pick every hour on the same day");
  });

  it("adds and drops hours up to the tier's count", () => {
    const first = { starts_at: "a", ends_at: "b" };
    const second = { starts_at: "c", ends_at: "d" };
    const third = { starts_at: "e", ends_at: "f" };
    expect(togglePicked([], first, 2)).toEqual([first]);
    expect(togglePicked([first], first, 2)).toEqual([]);
    expect(togglePicked([first, second], third, 2)).toEqual([first, second]);
    expect(formatPickedProgress(2, 3)).toBe("2 of 3 hours picked");
    expect(formatPickedProgress(0, 1)).toBe("0 of 1 hour picked");
  });

  it("labels hours and groups them by day", () => {
    const slots = [
      { starts_at: day.slots[1]!.starts_at, ends_at: day.slots[1]!.ends_at },
      { starts_at: day.slots[0]!.starts_at, ends_at: day.slots[0]!.ends_at },
      {
        starts_at: "2026-09-15T09:30:00.000Z",
        ends_at: "2026-09-15T10:30:00.000Z",
      },
    ];
    expect(formatHourRange(slots[1]!.starts_at, slots[1]!.ends_at, IST)).toBe(
      "2–3 pm",
    );
    expect(formatSlotLine(slots[1]!, IST)).toBe("Sun, 13 Sept · 2–3 pm");
    expect(groupSlotsByDay(slots, IST)).toEqual([
      {
        dateKey: "2026-09-13",
        dayLabel: "Sun, 13 Sept",
        timesLabel: "2–3 pm, 3–4 pm",
      },
      { dateKey: "2026-09-15", dayLabel: "Tue, 15 Sept", timesLabel: "3–4 pm" },
    ]);
    expect(formatDayRange(slots, IST)).toBe("Sun, 13 Sept – Tue, 15 Sept");
    expect(toBookingWhenLines(slots, IST)).toEqual([
      "Sun, 13 Sept · 2–3 pm, 3–4 pm",
      "Tue, 15 Sept · 3–4 pm",
    ]);
    expect(toBookingWhenLines(slots.slice(0, 2), IST)).toEqual([
      "2–3 pm, 3–4 pm",
    ]);
    expect(formatDayRange(slots.slice(0, 2), IST)).toBe("Sun, 13 Sept");
    expect(toPickedSlots(slots, IST).map((s) => s.startsAt)).toEqual([
      slots[1]?.starts_at,
      slots[0]?.starts_at,
      slots[2]?.starts_at,
    ]);
  });

  it("writes the WhatsApp message", () => {
    const message = toWhatsAppSessionMessage({
      bookingId: "WS-ABC",
      when: "Sun 13 Sep, 2:00 pm",
      hours: 2,
      participants: 1,
      total: "₹1,700",
      guestName: "Maya",
    });
    expect(message).toContain("Booking: WS-ABC");
    expect(message).toContain("2 hours for 1 person");
  });
});
