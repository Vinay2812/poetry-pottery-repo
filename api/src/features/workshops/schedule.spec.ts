import { describe, expect, it } from "vitest";

import {
  addDays,
  buildAvailability,
  DayClosedKind,
  checkSlots,
  fromWallClock,
  occupancy,
  type ScheduleConfig,
  slotBounds,
  slotsPerBooking,
  spanDays,
  toWallClock,
} from "./schedule";

const config: ScheduleConfig = {
  timezone: "Asia/Kolkata",
  opening_minutes: 13 * 60,
  closing_minutes: 19 * 60,
  slot_minutes: 60,
  capacity_per_slot: 6,
  booking_window_days: 60,
  slot_span_days: 7,
  closed_weekdays: [1],
};

// Saturday 12 Sep 2026, 10:00 IST
const now = new Date("2026-09-12T04:30:00.000Z");

describe("wall clock conversion", () => {
  it("round-trips IST times", () => {
    const instant = fromWallClock("2026-09-12", 13 * 60, "Asia/Kolkata");
    expect(instant.toISOString()).toBe("2026-09-12T07:30:00.000Z");
    expect(toWallClock(instant, "Asia/Kolkata")).toEqual({
      date: "2026-09-12",
      weekday: 6,
      minutes: 780,
    });
  });

  it("handles a DST zone", () => {
    const summer = fromWallClock("2026-07-01", 9 * 60, "Europe/London");
    const winter = fromWallClock("2026-12-01", 9 * 60, "Europe/London");
    expect(summer.toISOString()).toBe("2026-07-01T08:00:00.000Z");
    expect(winter.toISOString()).toBe("2026-12-01T09:00:00.000Z");
  });

  it("adds days across month ends", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
  });
});

describe("buildAvailability", () => {
  it("marks closed weekdays, blackouts, full slots and short notice", () => {
    const monday = "2026-09-14";
    const days = buildAvailability({
      config,
      from: "2026-09-12",
      days: 3,
      now,
      blackouts: [
        {
          starts_at: fromWallClock("2026-09-13", 15 * 60, config.timezone),
          ends_at: fromWallClock("2026-09-13", 17 * 60, config.timezone),
          reason: "Kiln firing",
        },
      ],
      occupants: [
        {
          starts_at: fromWallClock("2026-09-13", 13 * 60, config.timezone),
          ends_at: fromWallClock("2026-09-13", 14 * 60, config.timezone),
          participants: 6,
        },
      ],
    });

    expect(days.map((day) => day.date)).toEqual([
      "2026-09-12",
      "2026-09-13",
      monday,
    ]);
    expect(days[2]).toMatchObject({
      is_closed: true,
      reason: "Studio closed",
      weekday: 1,
    });
    expect(days[0]?.slots).toHaveLength(6);
    expect(days[0]?.slots[0]?.is_available).toBe(true);
    const sunday = days[1]?.slots ?? [];
    expect(sunday[0]).toMatchObject({
      remaining: 0,
      is_available: false,
      reason: "Fully booked",
    });
    expect(sunday[2]).toMatchObject({
      is_available: false,
      reason: "Kiln firing",
    });
    expect(sunday[3]).toMatchObject({
      is_available: false,
      reason: "Kiln firing",
    });
    expect(sunday[4]?.is_available).toBe(true);
  });

  it("flags slots inside the lead time and past days", () => {
    const days = buildAvailability({
      config,
      from: "2026-09-11",
      days: 2,
      now: new Date("2026-09-12T08:00:00.000Z"),
      blackouts: [],
      occupants: [],
    });
    expect(days[0]).toMatchObject({ is_closed: true, reason: "Past" });
    expect(days[1]?.slots[0]).toMatchObject({ reason: "Too soon" });
    expect(days[1]?.slots[3]?.is_available).toBe(true);
  });
});

describe("closed_kind", () => {
  const occupyAll = (date: string) =>
    Array.from({ length: 6 }, (_, index) => ({
      starts_at: fromWallClock(date, (13 + index) * 60, config.timezone),
      ends_at: fromWallClock(date, (14 + index) * 60, config.timezone),
      participants: config.capacity_per_slot,
    }));

  it("says full for a booked-out day and not-open-yet beyond the window", () => {
    const days = buildAvailability({
      config,
      from: "2026-09-13",
      days: 1,
      now,
      blackouts: [],
      occupants: occupyAll("2026-09-13"),
    });
    expect(days[0]).toMatchObject({
      is_closed: true,
      closed_kind: DayClosedKind.FULLY_BOOKED,
    });

    const far = buildAvailability({
      config,
      from: "2027-06-01",
      days: 1,
      now,
      blackouts: [],
      occupants: [],
    });
    expect(far[0]?.closed_kind).toBe(DayClosedKind.NOT_YET_OPEN);
  });

  it("calls a fully blacked-out day a closure and an open day nothing", () => {
    const days = buildAvailability({
      config,
      from: "2026-09-12",
      days: 2,
      now,
      blackouts: [
        {
          starts_at: fromWallClock("2026-09-13", 0, config.timezone),
          ends_at: fromWallClock("2026-09-14", 0, config.timezone),
          reason: "Kiln firing",
        },
      ],
      occupants: [],
    });
    expect(days[0]?.closed_kind).toBeNull();
    expect(days[1]?.closed_kind).toBe(DayClosedKind.STUDIO_CLOSED);
  });
});

describe("spanDays and slotBounds", () => {
  const at = (date: string, hour: number) =>
    fromWallClock(date, hour * 60, config.timezone);

  it("counts both ends of the span", () => {
    expect(spanDays([at("2026-09-13", 14)], config.timezone)).toBe(1);
    expect(
      spanDays([at("2026-09-13", 14), at("2026-09-15", 14)], config.timezone),
    ).toBe(3);
  });

  it("derives the first start and last end", () => {
    const bounds = slotBounds([at("2026-09-15", 14), at("2026-09-13", 18)], 60);
    expect(bounds.starts_at).toEqual(at("2026-09-13", 18));
    expect(bounds.ends_at).toEqual(at("2026-09-15", 15));
  });
});

describe("checkSlots", () => {
  const at = (date: string, hour: number) =>
    fromWallClock(date, hour * 60, config.timezone);
  const request = (
    slot_starts: Date[],
    hours = slot_starts.length,
    participants = 2,
  ) => ({
    slot_starts,
    hours,
    participants,
  });

  it("accepts hours spread over separate days", () => {
    expect(
      checkSlots(
        request([at("2026-09-13", 14), at("2026-09-15", 17)]),
        config,
        now,
        [],
        [],
      ),
    ).toEqual({ ok: true });
  });

  it("counts occupancy for each chosen hour on its own", () => {
    const busy = [
      {
        starts_at: at("2026-09-15", 17),
        ends_at: at("2026-09-15", 18),
        participants: 5,
      },
    ];
    expect(occupancy(busy[0]!, busy)).toBe(5);
    expect(
      checkSlots(
        request([at("2026-09-13", 14), at("2026-09-15", 17)]),
        config,
        now,
        [],
        busy,
      ),
    ).toMatchObject({
      ok: false,
      reason: "Not enough wheels free for one of those hours",
    });
  });

  it("needs exactly as many hours as the tier", () => {
    expect(
      checkSlots(request([at("2026-09-13", 14)], 2), config, now, [], []),
    ).toMatchObject({ reason: "Pick 2 hours for a 2 hour session" });
    expect(
      checkSlots(
        request([at("2026-09-13", 14), at("2026-09-13", 14)]),
        config,
        now,
        [],
        [],
      ),
    ).toMatchObject({ reason: "You picked the same hour twice" });
  });

  it("keeps the whole set inside the allowed span", () => {
    expect(
      checkSlots(
        request([at("2026-09-13", 14), at("2026-09-22", 14)]),
        config,
        now,
        [],
        [],
      ),
    ).toMatchObject({
      reason: "Keep every hour within 7 days of the first",
    });
    expect(
      checkSlots(
        request([at("2026-09-13", 14), at("2026-09-15", 14)]),
        { ...config, slot_span_days: 1 },
        now,
        [],
        [],
      ),
    ).toMatchObject({ reason: "Keep every hour on the same day" });
  });

  it("rejects off-grid, out-of-hours, closed, blacked out and oversized requests", () => {
    expect(
      checkSlots(
        request([new Date(at("2026-09-13", 14).getTime() + 15 * 60_000)]),
        config,
        now,
        [],
        [],
      ),
    ).toMatchObject({ reason: "Choose an hour from the calendar" });
    expect(
      checkSlots(request([at("2026-09-13", 19)]), config, now, [], []),
    ).toMatchObject({ reason: "That time is outside studio hours" });
    expect(
      checkSlots(request([at("2026-09-14", 14)]), config, now, [], []),
    ).toMatchObject({ reason: "The studio is closed that day" });
    expect(
      checkSlots(request([at("2026-09-13", 14)], 1, 7), config, now, [], []),
    ).toMatchObject({ reason: "Sessions take 1 to 6 people" });
    expect(
      checkSlots(request([at("2026-12-01", 14)]), config, now, [], []),
    ).toMatchObject({ reason: "Bookings open 60 days ahead" });
    expect(
      checkSlots(
        request([at("2026-09-13", 15)]),
        config,
        now,
        [
          {
            starts_at: at("2026-09-13", 15),
            ends_at: at("2026-09-13", 17),
            reason: "Kiln firing",
          },
        ],
        [],
      ),
    ).toMatchObject({ reason: "Kiln firing" });
  });
});

describe("slotsPerBooking", () => {
  it("never books fewer slots than the hours paid for", () => {
    expect(slotsPerBooking(2, { slot_minutes: 30 })).toBe(4);
    expect(slotsPerBooking(2, { slot_minutes: 90 })).toBe(2);
  });
});
