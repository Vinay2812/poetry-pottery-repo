import { describe, expect, it } from "vitest";

import { slotsNeeded, type WorkshopDayData } from "@/features/workshops/types";

import {
  addDays,
  daysInMonth,
  formatMonth,
  isDayWithinSpan,
  isSameSelection,
  isSlotPickable,
  pickableSlots,
  shiftMonth,
  spanDays,
  suggestSlots,
  togglePicked,
  toCalendarWeeks,
  toDaysKeptByNextPick,
  toReachReason,
  toSlotOptions,
  toMonthGrid,
  toMonthKey,
  toPickedSlots,
  toVisibleWeeks,
} from "./grid";

const IST = "Asia/Kolkata";

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
  it("shifts months and counts their days", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(daysInMonth("2026-02")).toBe(28);
  });

  it("walks days and months across their boundaries", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDays("2026-09-13", 0)).toBe("2026-09-13");
    expect(toMonthKey("2026-09-13")).toBe("2026-09");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(daysInMonth("2028-02")).toBe(29);
    expect(formatMonth("2026-09")).toBe("September 2026");
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

describe("slot helpers", () => {
  const day: WorkshopDayData = {
    date: "2026-09-13",
    weekday: 0,
    is_closed: false,
    closed_kind: null,
    reason: null,
    slots: [slot(13, 6), slot(14, 2), slot(15, 0, false), slot(16, 6)],
  };

  it("counts the hours a tier needs from the studio's slot length", () => {
    expect(slotsNeeded(2, 30)).toBe(4);
    expect(slotsNeeded(1.5, 60)).toBe(2);
    expect(slotsNeeded(0, 60)).toBe(1);
    // Never fewer slots than the hours bought.
    expect(slotsNeeded(2, 90)).toBe(2);
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
  });

  it("starts the month at the current week", () => {
    const week = (isPast: boolean) =>
      Array.from({ length: 7 }, (_, index) => ({
        dateKey: `2026-09-0${index + 1}`,
        dayNumber: index + 1,
        dayLabel: "",
        wheelsFree: 4,
        pickedCount: 0,
        isLoaded: true,
        isClosed: false,
        closedKind: null,
        isPast,
        mutedReason: null,
      }));
    const gone = week(true);
    const ahead = week(false);
    // A week with its last days still ahead stays, padding and all.
    const straddling = [...gone.slice(0, 3), ...ahead.slice(3), null];
    expect(toVisibleWeeks([gone, straddling, ahead])).toEqual([
      straddling,
      ahead,
    ]);
    // A month entirely behind is shown as it is rather than as nothing.
    expect(toVisibleWeeks([gone, gone])).toEqual([gone, gone]);
  });

  it("measures a new pick against the times a swap would keep", () => {
    expect(toDaysKeptByNextPick(["2026-11-28", "2026-11-25"], 2)).toEqual([
      "2026-11-28",
    ]);
    // Until the pick is full nothing is dropped.
    expect(toDaysKeptByNextPick(["2026-11-25"], 2)).toEqual(["2026-11-25"]);
    // One time needed: the only pick is the one replaced.
    expect(toDaysKeptByNextPick(["2026-11-25"], 1)).toEqual([]);
  });

  it("drops only one of two times on the same day", () => {
    expect(toDaysKeptByNextPick(["2026-11-25", "2026-11-25"], 2)).toEqual([
      "2026-11-25",
    ]);
    expect(
      toDaysKeptByNextPick(["2026-11-28", "2026-11-25", "2026-11-25"], 3),
    ).toEqual(["2026-11-25", "2026-11-28"]);
    expect(
      toDaysKeptByNextPick(["2026-11-25", "2026-11-28", "2026-11-28"], 3),
    ).toEqual(["2026-11-28", "2026-11-28"]);
  });

  // Matches the API's checkSlots: every final start within slot_span_days, both ends counted.
  it("says why a day is out of reach of the picks a new one would keep", () => {
    const full = ["2026-11-22", "2026-11-24"];
    // A full pick swaps out 22 Nov, so 24–30 Nov is the reach.
    expect(toReachReason("2026-11-30", full, 2, 7)).toBeNull();
    expect(toReachReason("2026-12-01", full, 2, 7)).toBe(
      "Pick all your hours within a 7-day window",
    );
    // With 24 Nov removed nothing is swapped, so 22 Nov holds: 29 Nov is eight days out.
    expect(toReachReason("2026-11-28", ["2026-11-22"], 2, 7)).toBeNull();
    expect(toReachReason("2026-11-29", ["2026-11-22"], 2, 7)).toBe(
      "Pick all your hours within a 7-day window",
    );
    // Two times on 25 Nov: a swap drops one, the other still holds the window.
    expect(
      toReachReason("2026-12-02", ["2026-11-25", "2026-11-25"], 2, 7),
    ).toBe("Pick all your hours within a 7-day window");
    expect(
      toReachReason("2026-12-01", ["2026-11-25", "2026-11-25"], 2, 7),
    ).toBeNull();
  });

  it("offers no new times on a day out of reach but keeps picked ones removable", () => {
    const options = toSlotOptions(
      day,
      1,
      IST,
      "Pick all your hours within a 7-day window",
    );
    expect(options.map((option) => option.isDisabled)).toEqual([
      true,
      true,
      true,
      true,
    ]);
    expect(options.map((option) => option.reason)).toEqual([
      "Too far",
      "Too far",
      "Fully booked",
      "Too far",
    ]);
    const inReach = toSlotOptions(day, 1, IST, null);
    expect(inReach.map((option) => option.isDisabled)).toEqual([
      false,
      false,
      true,
      false,
    ]);
    expect(inReach[0]?.reason).toBeNull();
  });

  it("opens the days a full pick could swap into", () => {
    const open = (date: string): WorkshopDayData => ({ ...day, date });
    const mutedIn = (
      monthKey: string,
      dateKey: string,
      pickedDateKeys: string[],
      timesNeeded: number,
    ) =>
      toCalendarWeeks({
        monthKey,
        dayByKey: new Map([[dateKey, open(dateKey)]]),
        participants: 1,
        pickedDateKeys,
        timesNeeded,
        allowedSpanDays: 7,
        todayKey: "2026-11-01",
      })
        .flat()
        .find((cell) => cell?.dateKey === dateKey)?.mutedReason ?? null;
    const full = ["2026-11-25", "2026-11-28"];
    // Swapping out 25 Nov leaves 28 Nov–2 Dec, five days.
    expect(mutedIn("2026-12", "2026-12-02", full, 2)).toBeNull();
    // 28 Nov–4 Dec is exactly the 7-day window; 5 Dec is one day over.
    expect(mutedIn("2026-12", "2026-12-04", full, 2)).toBeNull();
    expect(mutedIn("2026-12", "2026-12-05", full, 2)).toBe(
      "Pick all your hours within a 7-day window",
    );
    // With a time still to pick, both picks hold the window: 25 Nov–2 Dec is eight days.
    expect(mutedIn("2026-12", "2026-12-02", full, 3)).toBe(
      "Pick all your hours within a 7-day window",
    );
    // A single time is always swapped, so any open day stays pickable.
    expect(mutedIn("2026-12", "2026-12-29", ["2026-11-25"], 1)).toBeNull();
  });

  it("marks only days the API returned as closed", () => {
    const weeks = toCalendarWeeks({
      monthKey: "2026-09",
      dayByKey: new Map([["2026-09-13", day]]),
      participants: 1,
      pickedDateKeys: [],
      timesNeeded: 1,
      allowedSpanDays: 7,
      todayKey: "2026-09-01",
    }).flat();
    const returned = weeks.find((cell) => cell?.dateKey === "2026-09-13");
    const missing = weeks.find((cell) => cell?.dateKey === "2026-09-14");
    expect(returned).toEqual(
      expect.objectContaining({ isLoaded: true, isClosed: false }),
    );
    expect(missing).toEqual(
      expect.objectContaining({ isLoaded: false, isClosed: false }),
    );
  });

  it("adds and drops hours up to the tier's count", () => {
    const first = { starts_at: "a", ends_at: "b" };
    const second = { starts_at: "c", ends_at: "d" };
    const third = { starts_at: "e", ends_at: "f" };
    expect(togglePicked([], first, 2)).toEqual([first]);
    expect(togglePicked([first], first, 2)).toEqual([]);
    // A full pick swaps out its earliest hour so a fresh click always lands.
    expect(togglePicked([first, second], third, 2)).toEqual([second, third]);
  });

  it("knows when a move would land on the hours already held", () => {
    const first = { starts_at: "a", ends_at: "b" };
    const second = { starts_at: "c", ends_at: "d" };
    const other = { starts_at: "e", ends_at: "f" };
    expect(isSameSelection([first], [first])).toBe(true);
    expect(isSameSelection([first, second], [second, first])).toBe(true);
    expect(isSameSelection([first], [other])).toBe(false);
    expect(isSameSelection([first], [first, second])).toBe(false);
    expect(isSameSelection([], [])).toBe(true);
  });

  it("lists picked hours in the order they happen", () => {
    const later = {
      starts_at: day.slots[1]!.starts_at,
      ends_at: day.slots[1]!.ends_at,
    };
    const earlier = {
      starts_at: day.slots[0]!.starts_at,
      ends_at: day.slots[0]!.ends_at,
    };
    expect(toPickedSlots([later, earlier], IST)).toEqual([
      { startsAt: earlier.starts_at, label: "Sun 13 Sep · 2–3 pm" },
      { startsAt: later.starts_at, label: "Sun 13 Sep · 3–4 pm" },
    ]);
    expect(toPickedSlots([], IST)).toEqual([]);
  });
});

describe("suggestSlots", () => {
  function dayOn(
    date: string,
    hours: number[],
    remaining = 6,
  ): WorkshopDayData {
    const [year, month, dayOfMonth] = date.split("-").map(Number);
    return {
      date,
      weekday: 0,
      is_closed: false,
      closed_kind: null,
      reason: null,
      slots: hours.map((hour) => {
        const starts = new Date(
          Date.UTC(
            year ?? 2026,
            (month ?? 1) - 1,
            dayOfMonth ?? 1,
            hour - 5,
            30,
          ),
        );
        return {
          starts_at: starts.toISOString(),
          ends_at: new Date(starts.getTime() + 3_600_000).toISOString(),
          remaining,
          is_available: true,
          reason: null,
        };
      }),
    };
  }
  const days = [
    dayOn("2026-09-18", [13, 14, 15]),
    dayOn("2026-09-19", [13, 14]),
    dayOn("2026-09-21", [14]),
  ];

  it("prefers one hour a day on the earliest separate days", () => {
    const picks = suggestSlots(days, 2, 1, 30, "2026-09-18");
    expect(picks?.map((slot) => slot.starts_at.slice(0, 13))).toEqual([
      "2026-09-18T08",
      "2026-09-19T08",
    ]);
  });

  it("stacks hours on a day when the span rules out separate days", () => {
    const picks = suggestSlots(days, 2, 1, 1, "2026-09-18");
    expect(picks?.map((slot) => slot.starts_at.slice(0, 13))).toEqual([
      "2026-09-18T08",
      "2026-09-18T09",
    ]);
  });

  it("skips days already gone and days without enough wheels", () => {
    const picks = suggestSlots(days, 1, 1, 30, "2026-09-19");
    expect(picks?.[0]?.starts_at.slice(0, 10)).toBe("2026-09-19");
    expect(
      suggestSlots([dayOn("2026-09-18", [13], 1)], 1, 2, 30, "2026-09-18"),
    ).toBeNull();
  });

  it("spreads hours thin before it stacks them", () => {
    const week = [
      dayOn("2026-09-21", [13, 14, 15, 16, 17, 18]),
      dayOn("2026-09-22", [13, 14, 15, 16, 17, 18]),
      dayOn("2026-09-23", [13, 14, 15, 16, 17, 18]),
      dayOn("2026-09-24", [13, 14, 15, 16, 17, 18]),
    ];
    const picks = suggestSlots(week, 6, 1, 30, "2026-09-21") ?? [];
    const perDay = new Map<string, number>();
    for (const slot of picks) {
      const day = slot.starts_at.slice(0, 10);
      perDay.set(day, (perDay.get(day) ?? 0) + 1);
    }
    expect([...perDay.entries()]).toEqual([
      ["2026-09-21", 2],
      ["2026-09-22", 2],
      ["2026-09-23", 1],
      ["2026-09-24", 1],
    ]);
  });

  it("gives up when the month cannot hold the hours", () => {
    expect(suggestSlots(days, 6, 1, 30, "2026-09-18")?.length).toBe(6);
    expect(suggestSlots(days, 7, 1, 30, "2026-09-18")).toBeNull();
    expect(suggestSlots(days, 0, 1, 30, "2026-09-18")).toEqual([]);
  });
});
