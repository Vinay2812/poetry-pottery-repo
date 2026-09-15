import { describe, expect, it } from "vitest";

import {
  addDays,
  buildAvailability,
  checkSession,
  fromWallClock,
  occupancy,
  type ScheduleConfig,
  toWallClock,
} from "./schedule";

const config: ScheduleConfig = {
  timezone: "Asia/Kolkata",
  opening_minutes: 13 * 60,
  closing_minutes: 19 * 60,
  slot_minutes: 60,
  capacity_per_slot: 6,
  booking_window_days: 60,
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

describe("checkSession", () => {
  const session = (
    date: string,
    startHour: number,
    hours: number,
    participants = 2,
  ) => ({
    starts_at: fromWallClock(date, startHour * 60, config.timezone),
    ends_at: fromWallClock(date, (startHour + hours) * 60, config.timezone),
    participants,
  });

  it("accepts a valid session and counts occupancy per slot", () => {
    expect(
      checkSession(session("2026-09-13", 14, 2), config, now, [], []),
    ).toEqual({ ok: true });
    const busy = [{ ...session("2026-09-13", 15, 1, 5), participants: 5 }];
    expect(
      checkSession(session("2026-09-13", 14, 2, 2), config, now, [], busy),
    ).toMatchObject({
      ok: false,
      reason: "Not enough wheels free for that session",
    });
    expect(occupancy(session("2026-09-13", 15, 1), busy)).toBe(5);
  });

  it("rejects off-grid, out-of-hours, closed and oversized requests", () => {
    expect(
      checkSession(
        {
          ...session("2026-09-13", 14, 1),
          starts_at: new Date(
            session("2026-09-13", 14, 1).starts_at.getTime() + 15 * 60_000,
          ),
        },
        config,
        now,
        [],
        [],
      ),
    ).toMatchObject({ reason: "Choose a session from the calendar" });
    expect(
      checkSession(session("2026-09-13", 18, 2), config, now, [], []),
    ).toMatchObject({ reason: "That time is outside studio hours" });
    expect(
      checkSession(session("2026-09-14", 14, 1), config, now, [], []),
    ).toMatchObject({ reason: "The studio is closed that day" });
    expect(
      checkSession(session("2026-09-13", 14, 1, 7), config, now, [], []),
    ).toMatchObject({ reason: "Sessions take 1 to 6 people" });
    expect(
      checkSession(session("2026-12-01", 14, 1), config, now, [], []),
    ).toMatchObject({ reason: "Bookings open 60 days ahead" });
  });
});
