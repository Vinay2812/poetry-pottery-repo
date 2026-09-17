import { describe, expect, it } from "vitest";

import {
  workshopBlackoutSchema,
  workshopConfigSchema,
  workshopTierSchema,
} from "./workshop";

function configValues(overrides: Record<string, unknown> = {}) {
  return {
    name: "Wheel session",
    description: "An hour at the wheel with a potter beside you.",
    is_active: true,
    timezone: "Asia/Kolkata",
    opening_time: "09:00",
    closing_time: "18:00",
    slot_minutes: 60,
    capacity_per_slot: 4,
    booking_window_days: 30,
    slot_span_days: 2,
    closed_weekdays: [0],
    ...overrides,
  };
}

function configError(overrides: Record<string, unknown>): string {
  const result = workshopConfigSchema.safeParse(configValues(overrides));
  return result.success ? "" : (result.error.issues[0]?.message ?? "");
}

describe("workshopConfigSchema", () => {
  it("accepts a filled-in studio and trims its text", () => {
    const result = workshopConfigSchema.parse(
      configValues({ name: "  Wheel session ", timezone: " Asia/Kolkata " }),
    );

    expect(result.name).toBe("Wheel session");
    expect(result.timezone).toBe("Asia/Kolkata");
  });

  it("rejects a closing time at or before the opening time", () => {
    expect(configError({ closing_time: "09:00" })).toBe(
      "Closing time must be after opening time",
    );
    expect(configError({ closing_time: "08:59" })).toBe(
      "Closing time must be after opening time",
    );
    expect(configError({ closing_time: "09:01" })).toBe("");
  });

  it("rejects times that are not a 24-hour clock", () => {
    expect(configError({ opening_time: "9:00" })).toBe(
      "Opening time is not valid",
    );
    expect(configError({ closing_time: "25:00" })).toBe(
      "Closing time is not valid",
    );
  });

  it("wants whole positive numbers for the slot settings", () => {
    expect(configError({ slot_minutes: 0 })).toBe(
      "Slot length must be at least 1",
    );
    expect(configError({ capacity_per_slot: 2.5 })).toBe(
      "Wheels per slot must be a whole number",
    );
    expect(configError({ booking_window_days: -1 })).toBe(
      "Booking window must be at least 1",
    );
    expect(configError({ slot_span_days: Number.NaN })).toBe(
      "Session span must be a number",
    );
  });

  it("keeps closed weekdays inside 0 to 6", () => {
    expect(
      workshopConfigSchema.safeParse(configValues({ closed_weekdays: [] }))
        .success,
    ).toBe(true);
    expect(
      workshopConfigSchema.safeParse(
        configValues({ closed_weekdays: [0, 1, 2, 3, 4, 5, 6] }),
      ).success,
    ).toBe(true);
    expect(configError({ closed_weekdays: [7] })).toBe(
      "Weekdays run from 0 to 6",
    );
  });

  it("wants a name and a timezone", () => {
    expect(configError({ name: "a" })).toBe(
      "Name must be at least 2 characters",
    );
    expect(configError({ timezone: "  " })).toBe("Timezone is required");
  });

  it("rejects a timezone Intl cannot read", () => {
    expect(configError({ timezone: "Asia/Kolkatta" })).toBe(
      "Use an IANA zone like Asia/Kolkata",
    );
    expect(configError({ timezone: "Mars/Olympus" })).toBe(
      "Use an IANA zone like Asia/Kolkata",
    );
    expect(
      workshopConfigSchema.safeParse(configValues({ timezone: "UTC" })).success,
    ).toBe(true);
  });
});

function tierError(overrides: Record<string, unknown>): string {
  const result = workshopTierSchema.safeParse({
    hours: 2,
    price_per_person: 1_200,
    pieces_per_person: 2,
    ...overrides,
  });
  return result.success ? "" : (result.error.issues[0]?.message ?? "");
}

describe("workshopTierSchema", () => {
  it("takes an hour, a price and a piece count", () => {
    expect(tierError({})).toBe("");
  });

  it("wants at least one hour", () => {
    expect(tierError({ hours: 0 })).toBe("Hours must be at least 1");
  });

  it("lets a price or a piece count be zero but not negative", () => {
    expect(tierError({ price_per_person: 0, pieces_per_person: 0 })).toBe("");
    expect(tierError({ price_per_person: -1 })).toBe(
      "Price per person must be at least 0",
    );
    expect(tierError({ pieces_per_person: -1 })).toBe(
      "Pieces per person must be at least 0",
    );
  });

  it("keeps money in whole rupees", () => {
    expect(tierError({ price_per_person: 1_200.5 })).toBe(
      "Price per person must be a whole number",
    );
  });
});

function blackoutError(overrides: Record<string, unknown>): string {
  const result = workshopBlackoutSchema.safeParse({
    starts_at: "2026-09-14T09:00",
    ends_at: "2026-09-14T18:00",
    reason: "Kiln repair",
    ...overrides,
  });
  return result.success ? "" : (result.error.issues[0]?.message ?? "");
}

describe("workshopBlackoutSchema", () => {
  it("takes a span and an optional reason", () => {
    expect(blackoutError({})).toBe("");
    expect(blackoutError({ reason: "" })).toBe("");
  });

  it("wants the end after the start", () => {
    expect(blackoutError({ ends_at: "2026-09-14T09:00" })).toBe(
      "The end must be after the start",
    );
    expect(blackoutError({ ends_at: "2026-09-13T18:00" })).toBe(
      "The end must be after the start",
    );
  });

  it("wants both ends picked", () => {
    expect(blackoutError({ starts_at: "" })).toBe("Pick when it starts");
    expect(blackoutError({ ends_at: "2026-09-14" })).toBe("Pick when it ends");
  });

  it("trims the reason", () => {
    const result = workshopBlackoutSchema.parse({
      starts_at: "2026-09-14T09:00",
      ends_at: "2026-09-14T18:00",
      reason: "  Kiln repair  ",
    });

    expect(result.reason).toBe("Kiln repair");
  });
});
