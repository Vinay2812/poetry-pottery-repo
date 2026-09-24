import { describe, expect, it } from "vitest";

import { RegistrationStatus } from "@/graphql/generated/graphql";

import {
  applyBlackoutPatch,
  applyBookingStatus,
  applyConfigPatch,
  applyTierPatch,
  describeClosedDays,
  describeSession,
  formatHoursLabel,
  formatParticipantsLabel,
  fromDateTimeLocal,
  minutesToTimeInput,
  timeInputToMinutes,
  toDateTimeLocal,
  toggleWeekday,
  toRangeEnd,
  toRangeStart,
  toWeekdayLabels,
  toWeekdayNumbers,
  type WorkshopBlackoutData,
  type WorkshopBookingData,
  type WorkshopConfigData,
  type WorkshopTierData,
  weekdayLabel,
  weekdayNumber,
} from "./types";

const IST = "Asia/Kolkata";

describe("minutesToTimeInput", () => {
  it("turns minutes past midnight into a time input value", () => {
    expect(minutesToTimeInput(540)).toBe("09:00");
    expect(minutesToTimeInput(0)).toBe("00:00");
    expect(minutesToTimeInput(1_035)).toBe("17:15");
  });

  it("keeps the value inside a single day", () => {
    expect(minutesToTimeInput(-30)).toBe("00:00");
    expect(minutesToTimeInput(2_000)).toBe("24:00");
  });
});

describe("timeInputToMinutes", () => {
  it("reads a time input value back to minutes", () => {
    expect(timeInputToMinutes("09:00")).toBe(540);
    expect(timeInputToMinutes("17:15")).toBe(1_035);
    expect(timeInputToMinutes("00:00")).toBe(0);
  });

  it("falls back to midnight when the field is empty", () => {
    expect(timeInputToMinutes("")).toBe(0);
    expect(timeInputToMinutes("nonsense")).toBe(0);
  });

  it("round-trips every quarter hour", () => {
    for (let minutes = 0; minutes < 24 * 60; minutes += 15) {
      expect(timeInputToMinutes(minutesToTimeInput(minutes))).toBe(minutes);
    }
  });
});

describe("weekdays", () => {
  it("numbers days the way Date#getDay does", () => {
    expect(weekdayLabel(0)).toBe("Sunday");
    expect(weekdayLabel(6)).toBe("Saturday");
    expect(weekdayNumber("Sunday")).toBe(0);
    expect(weekdayNumber("Wednesday")).toBe(3);
    expect(weekdayNumber("Fireday")).toBe(-1);
  });

  it("maps a list of numbers to labels and back", () => {
    expect(toWeekdayLabels([2, 0])).toEqual(["Sunday", "Tuesday"]);
    expect(toWeekdayNumbers(["Tuesday", "Sunday"])).toEqual([0, 2]);
    expect(toWeekdayNumbers(["Tuesday", "Nope"])).toEqual([2]);
  });

  it("drops numbers that are not weekdays", () => {
    expect(toWeekdayLabels([1, 9, -2])).toEqual(["Monday"]);
  });

  it("toggles a day in and out, keeping the list sorted", () => {
    expect(toggleWeekday([1, 3], 2)).toEqual([1, 2, 3]);
    expect(toggleWeekday([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("says plainly which days the studio is closed", () => {
    expect(describeClosedDays([])).toBe("Open every day");
    expect(describeClosedDays([1, 0])).toBe("Closed on Sunday, Monday");
  });
});

describe("datetime-local conversion", () => {
  it("renders an instant as the studio wall clock", () => {
    expect(toDateTimeLocal("2026-09-14T03:30:00.000Z", IST)).toBe(
      "2026-09-14T09:00",
    );
    expect(toDateTimeLocal("2026-09-14T03:30:00.000Z", "UTC")).toBe(
      "2026-09-14T03:30",
    );
  });

  it("renders midnight as 00:00 rather than 24:00", () => {
    expect(toDateTimeLocal("2026-09-13T18:30:00.000Z", IST)).toBe(
      "2026-09-14T00:00",
    );
  });

  it("reads a studio wall clock back to an instant", () => {
    expect(fromDateTimeLocal("2026-09-14T09:00", IST)).toBe(
      "2026-09-14T03:30:00.000Z",
    );
    expect(fromDateTimeLocal("2026-09-14T03:30", "UTC")).toBe(
      "2026-09-14T03:30:00.000Z",
    );
  });

  it("survives a timezone that changes offset in the middle of the year", () => {
    const summer = fromDateTimeLocal("2026-07-01T12:00", "Europe/London");
    const winter = fromDateTimeLocal("2026-12-01T12:00", "Europe/London");

    expect(summer).toBe("2026-07-01T11:00:00.000Z");
    expect(winter).toBe("2026-12-01T12:00:00.000Z");
  });

  it("round-trips both ways", () => {
    const wall = "2026-03-08T02:30";
    expect(toDateTimeLocal(fromDateTimeLocal(wall, IST), IST)).toBe(wall);
  });

  it("treats an empty field as no value", () => {
    expect(toDateTimeLocal("", IST)).toBe("");
    expect(fromDateTimeLocal("", IST)).toBe("");
    expect(fromDateTimeLocal("not-a-date", IST)).toBe("");
  });

  it("falls back to IST instead of throwing on a stored zone Intl cannot read", () => {
    expect(toDateTimeLocal("2026-09-14T03:30:00.000Z", "Asia/Kolkatta")).toBe(
      toDateTimeLocal("2026-09-14T03:30:00.000Z", IST),
    );
    expect(fromDateTimeLocal("2026-09-14T09:00", "Asia/Kolkatta")).toBe(
      fromDateTimeLocal("2026-09-14T09:00", IST),
    );
    expect(toRangeStart("2026-09-14", "Asia/Kolkatta")).toBe(
      toRangeStart("2026-09-14", IST),
    );
    expect(toRangeEnd("2026-09-14", "Asia/Kolkatta")).toBe(
      toRangeEnd("2026-09-14", IST),
    );
  });
});

describe("date range filters", () => {
  it("starts a day at its first instant in the studio timezone", () => {
    expect(toRangeStart("2026-09-14", IST)).toBe("2026-09-13T18:30:00.000Z");
    expect(toRangeStart("2026-09-14", "UTC")).toBe("2026-09-14T00:00:00.000Z");
  });

  it("ends a day right before the next one begins", () => {
    expect(toRangeEnd("2026-09-14", IST)).toBe("2026-09-14T18:29:59.999Z");
    expect(toRangeEnd("2026-09-14", "UTC")).toBe("2026-09-14T23:59:59.999Z");
  });

  it("covers a month boundary", () => {
    expect(toRangeEnd("2026-01-31", "UTC")).toBe("2026-01-31T23:59:59.999Z");
  });

  it("returns nothing when the filter is unset", () => {
    expect(toRangeStart("", IST)).toBe("");
    expect(toRangeEnd("", IST)).toBe("");
  });
});

describe("booking copy", () => {
  it("counts hours and people in words", () => {
    expect(formatHoursLabel(1)).toBe("1 hour");
    expect(formatHoursLabel(3)).toBe("3 hours");
    expect(formatParticipantsLabel(1)).toBe("1 person");
    expect(formatParticipantsLabel(2)).toBe("2 people");
  });

  it("writes a session as one day and two times", () => {
    expect(
      describeSession("2026-09-14T03:30:00.000Z", "2026-09-14T05:30:00.000Z"),
    ).toBe("Mon, 14 Sept, 2026, 9:00 am → 11:00 am");
  });

  it("names both days when a session spans two", () => {
    expect(
      describeSession("2026-09-14T03:30:00.000Z", "2026-09-15T05:30:00.000Z"),
    ).toBe("Mon, 14 Sept, 2026, 9:00 am → Tue, 15 Sept, 2026, 11:00 am");
  });
});

function bookingRow(id: string, status: RegistrationStatus) {
  return {
    next_statuses: [
      RegistrationStatus.Approved,
      RegistrationStatus.Rejected,
    ] as RegistrationStatus[],
    customer: {
      id: 1,
      name: "Maya Iyer",
      email: "maya@example.com",
      image: null,
    },
    booking: {
      id,
      starts_at: "2026-09-14T03:30:00.000Z",
      ends_at: "2026-09-14T05:30:00.000Z",
      hours: 2,
      participants: 1,
      total: 2_400,
      status,
      note: null,
      created_at: "2026-09-01T06:00:00.000Z",
      config: { id: 1, name: "Wheel session", slug: "wheel-session" },
    },
  } satisfies WorkshopBookingData;
}

describe("applyBookingStatus", () => {
  it("moves one row to its new status and parks its actions", () => {
    const rows = [
      bookingRow("one", RegistrationStatus.Pending),
      bookingRow("two", RegistrationStatus.Pending),
    ];

    const next = applyBookingStatus(rows, {
      id: "two",
      status: RegistrationStatus.Approved,
    });

    expect(next[0]?.booking.status).toBe(RegistrationStatus.Pending);
    expect(next[0]?.next_statuses).toHaveLength(2);
    expect(next[1]?.booking.status).toBe(RegistrationStatus.Approved);
    expect(next[1]?.next_statuses).toEqual([]);
  });

  it("leaves the rows alone when the id is not on the page", () => {
    const rows = [bookingRow("one", RegistrationStatus.Pending)];

    expect(
      applyBookingStatus(rows, {
        id: "gone",
        status: RegistrationStatus.Cancelled,
      }),
    ).toEqual(rows);
  });
});

function config(id: number, name: string) {
  return {
    id,
    slug: `studio-${id}`,
    name,
    description: null,
    image_url: null,
    is_active: true,
    timezone: "Asia/Kolkata",
    opening_minutes: 540,
    closing_minutes: 1_080,
    slot_minutes: 60,
    capacity_per_slot: 4,
    booking_window_days: 30,
    slot_span_days: 2,
    closed_weekdays: [0],
    tiers: [],
  } satisfies WorkshopConfigData;
}

describe("applyConfigPatch", () => {
  it("merges the saved fields into the config being edited", () => {
    const configs = [config(1, "Wheel session"), config(2, "Hand building")];

    const next = applyConfigPatch(configs, {
      id: 2,
      changes: { name: "Hand building evening", is_active: false },
    });

    expect(next[0]?.name).toBe("Wheel session");
    expect(next[1]?.name).toBe("Hand building evening");
    expect(next[1]?.is_active).toBe(false);
    expect(next[1]?.timezone).toBe("Asia/Kolkata");
  });
});

function tier(id: number, hours: number): WorkshopTierData {
  return {
    id,
    hours,
    price_per_person: hours * 600,
    pieces_per_person: hours,
  };
}

describe("applyTierPatch", () => {
  it("replaces the row that already holds those hours", () => {
    const tiers = [tier(1, 1), tier(2, 2)];

    const next = applyTierPatch(tiers, {
      kind: "save",
      tier: { id: 2, hours: 2, price_per_person: 1_500, pieces_per_person: 3 },
    });

    expect(next).toHaveLength(2);
    expect(next[1]?.price_per_person).toBe(1_500);
  });

  it("adds a new length in hour order", () => {
    const next = applyTierPatch([tier(1, 3)], {
      kind: "save",
      tier: tier(2, 1),
    });

    expect(next.map((row) => row.hours)).toEqual([1, 3]);
  });

  it("removes a row by id", () => {
    const next = applyTierPatch([tier(1, 1), tier(2, 2)], {
      kind: "remove",
      tier: tier(1, 1),
    });

    expect(next.map((row) => row.id)).toEqual([2]);
  });
});

function blackout(id: number, startsAt: string): WorkshopBlackoutData {
  return {
    id,
    config_id: 1,
    starts_at: startsAt,
    ends_at: "2026-12-31T00:00:00.000Z",
    reason: null,
  };
}

describe("applyBlackoutPatch", () => {
  it("adds a new spell in date order", () => {
    const next = applyBlackoutPatch([blackout(1, "2026-10-01T00:00:00.000Z")], {
      kind: "save",
      blackout: blackout(2, "2026-09-01T00:00:00.000Z"),
    });

    expect(next.map((row) => row.id)).toEqual([2, 1]);
  });

  it("updates a spell it already holds", () => {
    const next = applyBlackoutPatch([blackout(1, "2026-10-01T00:00:00.000Z")], {
      kind: "save",
      blackout: { ...blackout(1, "2026-10-01T00:00:00.000Z"), reason: "Kiln" },
    });

    expect(next).toHaveLength(1);
    expect(next[0]?.reason).toBe("Kiln");
  });

  it("never shows a draft twice once its saved spell is read back", () => {
    const next = applyBlackoutPatch([blackout(5, "2026-10-01T00:00:00.000Z")], {
      kind: "save",
      blackout: blackout(0, "2026-10-01T00:00:00.000Z"),
    });

    expect(next.map((row) => row.id)).toEqual([5]);
  });

  it("removes a spell by id", () => {
    const next = applyBlackoutPatch(
      [
        blackout(1, "2026-10-01T00:00:00.000Z"),
        blackout(2, "2026-11-01T00:00:00.000Z"),
      ],
      { kind: "remove", blackout: blackout(2, "2026-11-01T00:00:00.000Z") },
    );

    expect(next.map((row) => row.id)).toEqual([1]);
  });
});
