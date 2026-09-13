import { describe, expect, it } from "vitest";

import {
  bookableStarts,
  daysInMonth,
  formatDateKey,
  isSessionBookable,
  pickTier,
  quoteSession,
  sessionCapacity,
  shiftMonth,
  toDateKey,
  toMonthGrid,
  toWhatsAppSessionMessage,
  type WorkshopDayData,
} from "./types";

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

  it("requires consecutive open slots with enough room", () => {
    const first = day.slots[0]?.starts_at ?? "";
    const second = day.slots[1]?.starts_at ?? "";
    expect(isSessionBookable(day.slots, first, 1, 6, 60)).toBe(true);
    expect(isSessionBookable(day.slots, first, 2, 2, 60)).toBe(true);
    expect(isSessionBookable(day.slots, first, 2, 3, 60)).toBe(false);
    expect(isSessionBookable(day.slots, second, 2, 1, 60)).toBe(false);
    expect(sessionCapacity(day.slots, first, 2, 60)).toBe(2);
    expect(bookableStarts(day, 1, 1, 60).map((s) => s.starts_at)).toEqual([
      first,
      second,
      day.slots[3]?.starts_at,
    ]);
    expect(bookableStarts({ ...day, is_closed: true }, 1, 1, 60)).toEqual([]);
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
