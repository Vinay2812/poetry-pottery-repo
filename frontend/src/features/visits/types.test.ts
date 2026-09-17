import { describe, expect, it } from "vitest";

import type { VisitDayData } from "./types";
import {
  countOpen,
  firstOpenDate,
  toConfirmationLine,
  toDateKey,
  toDayLabel,
  toDayNumber,
  toLongDayLabel,
  toWindowLabel,
  windowsFor,
} from "./types";

function day(date: string, openStarts: string[], shut = 0): VisitDayData {
  const windows = [
    ...openStarts.map((starts) => ({
      starts_at: starts,
      ends_at: new Date(Date.parse(starts) + 1_800_000).toISOString(),
      is_available: true,
      reason: null,
    })),
    ...Array.from({ length: shut }, (_, index) => ({
      starts_at: `${date}T0${index}:00:00.000Z`,
      ends_at: `${date}T0${index}:30:00.000Z`,
      is_available: false,
      reason: "Fully booked",
    })),
  ];
  return {
    date,
    weekday: 1,
    is_closed: openStarts.length === 0,
    reason: null,
    windows,
  };
}

describe("day labels", () => {
  it("names the day and its number in the studio's zone", () => {
    expect(toDayLabel("2026-09-17")).toBe("Thu");
    expect(toDayNumber("2026-09-17")).toBe("17");
    expect(toLongDayLabel("2026-09-17")).toBe("Thursday, 17 September");
  });
});

describe("toDateKey", () => {
  it("reads the day an instant falls on in Sangli, not in UTC", () => {
    // 19:30 UTC is already the next morning in India.
    expect(toDateKey("2026-09-17T19:30:00.000Z")).toBe("2026-09-18");
    expect(toDateKey("2026-09-17T06:30:00.000Z")).toBe("2026-09-17");
  });
});

describe("toWindowLabel", () => {
  it("says the meridiem once when both ends share it", () => {
    expect(
      toWindowLabel("2026-09-17T06:30:00.000Z", "2026-09-17T07:00:00.000Z"),
    ).toBe("12:00–12:30 pm");
  });

  it("says it twice when the window crosses noon or midnight", () => {
    expect(
      toWindowLabel("2026-09-17T06:00:00.000Z", "2026-09-17T06:30:00.000Z"),
    ).toBe("11:30 am–12:00 pm");
  });
});

describe("firstOpenDate", () => {
  it("skips days with nothing left", () => {
    expect(
      firstOpenDate([
        day("2026-09-17", [], 2),
        day("2026-09-18", ["2026-09-18T06:30:00.000Z"]),
      ]),
    ).toBe("2026-09-18");
  });

  it("has nothing to offer when the fortnight is full", () => {
    expect(firstOpenDate([day("2026-09-17", [], 2)])).toBeNull();
    expect(firstOpenDate([])).toBeNull();
  });
});

describe("windowsFor and countOpen", () => {
  it("returns only the picked day's windows", () => {
    const days = [
      day("2026-09-17", ["2026-09-17T06:30:00.000Z"], 1),
      day("2026-09-18", ["2026-09-18T06:30:00.000Z"]),
    ];
    expect(windowsFor(days, "2026-09-17")).toHaveLength(2);
    expect(windowsFor(days, "2026-09-19")).toEqual([]);
    expect(windowsFor(days, null)).toEqual([]);
  });

  it("counts only the windows still free", () => {
    expect(countOpen(day("2026-09-17", ["2026-09-17T06:30:00.000Z"], 3))).toBe(
      1,
    );
  });
});

describe("toConfirmationLine", () => {
  it("repeats the window and the day back to the visitor", () => {
    expect(
      toConfirmationLine(
        "Maya",
        "2026-09-17T06:30:00.000Z",
        "2026-09-17T07:00:00.000Z",
      ),
    ).toBe(
      "Thanks Maya, we have you down for 12:00–12:30 pm on Thursday, 17 September. Come to the gate and ring the bell.",
    );
  });
});
