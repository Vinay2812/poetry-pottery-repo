import { describe, expect, it } from "vitest";

import {
  type StudioWheel,
  toStudioDaysLabel,
  toStudioHoursLabel,
  toStudioNote,
  toStudioOffer,
  toStudioPriceLabel,
  toStudioSchedule,
  toStudioSection,
} from "./types";

function tier(hours: number, price = 1100) {
  return { hours, price_per_person: price, pieces_per_person: 1 };
}

function wheel(
  closedWeekdays: number[],
  tierHours: number[] = [1, 2, 3],
): StudioWheel {
  return {
    opening_minutes: 780,
    closing_minutes: 1140,
    closed_weekdays: closedWeekdays,
    tiers: tierHours.map((hours) => tier(hours)),
  };
}

describe("toStudioHoursLabel", () => {
  it("shares the meridiem when both ends have it", () => {
    expect(toStudioHoursLabel(780, 1140)).toBe("1 to 7 pm");
  });

  it("spells both ends across noon and keeps odd minutes", () => {
    expect(toStudioHoursLabel(660, 840)).toBe("11 am to 2 pm");
    expect(toStudioHoursLabel(630, 1110)).toBe("10:30 am to 6:30 pm");
  });
});

describe("toStudioDaysLabel", () => {
  it("names the one closed day, or none", () => {
    expect(toStudioDaysLabel([])).toBe("Every day");
    expect(toStudioDaysLabel([1])).toBe("Every day except Monday");
  });

  it("lists several closed days in week order without repeats", () => {
    expect(toStudioDaysLabel([0, 2, 1, 1])).toBe(
      "Every day except Monday, Tuesday and Sunday",
    );
    expect(toStudioDaysLabel([2, 1, 1])).toBe(
      "Every day except Monday and Tuesday",
    );
    expect(toStudioDaysLabel([1, 2, 3])).toBe(
      "Every day except Monday, Tuesday and Wednesday",
    );
  });

  it("names the open days once they are fewer", () => {
    expect(toStudioDaysLabel([0, 1, 2, 3, 4, 5])).toBe("Saturdays only");
    expect(toStudioDaysLabel([1, 2, 3, 4, 5])).toBe(
      "Saturdays and Sundays only",
    );
  });

  it("has nothing to say when every day is closed", () => {
    expect(toStudioDaysLabel([0, 1, 2, 3, 4, 5, 6])).toBeNull();
  });
});

describe("toStudioPriceLabel", () => {
  it("reads the shortest tier whatever the order", () => {
    expect(toStudioPriceLabel([tier(3, 2700), tier(1, 1100)])).toBe(
      "From ₹1,100 a person for an hour",
    );
    expect(toStudioPriceLabel([tier(2, 2000)])).toBe(
      "From ₹2,000 a person for 2 hours",
    );
  });

  it("has nothing to say without tiers", () => {
    expect(toStudioPriceLabel([])).toBeNull();
  });
});

describe("toStudioOffer", () => {
  it("keeps the studio's own line when an hour to three is on offer", () => {
    expect(toStudioOffer([tier(3), tier(1), tier(2)])).toBe(
      "Book an hour or three.",
    );
  });

  it("says or more from the shortest tier otherwise", () => {
    expect(toStudioOffer([tier(1), tier(2)])).toBe("Book an hour or more.");
    expect(toStudioOffer([tier(2), tier(4)])).toBe("Book two hours or more.");
  });

  it("names the only length there is", () => {
    expect(toStudioOffer([tier(2)])).toBe("Book two hours.");
    expect(toStudioOffer([tier(1)])).toBe("Book an hour.");
  });

  it("offers nothing without tiers", () => {
    expect(toStudioOffer([])).toBeNull();
  });
});

describe("toStudioSchedule", () => {
  it("reads hours, days and offer off the wheel", () => {
    expect(toStudioSchedule(wheel([1]))).toEqual({
      hoursLabel: "1 to 7 pm",
      daysLabel: "Every day except Monday",
      priceLabel: "From ₹1,100 a person for an hour",
      offer: "Book an hour or three.",
    });
  });

  it("is empty without a wheel, an open day or a tier", () => {
    expect(toStudioSchedule(null)).toBeNull();
    expect(toStudioSchedule(wheel([0, 1, 2, 3, 4, 5, 6]))).toBeNull();
    expect(toStudioSchedule(wheel([], []))).toBeNull();
  });
});

describe("toStudioNote", () => {
  it("names the wheel's hours and days mid-sentence", () => {
    const schedule = toStudioSchedule(wheel([1]));
    expect(schedule && toStudioNote(schedule)).toBe(
      "Wheel sessions run 1 to 7 pm, every day except Monday. Book an hour or three.",
    );
  });

  it("reads several closed days as every day except", () => {
    const schedule = toStudioSchedule(wheel([1, 2]));
    expect(schedule && toStudioNote(schedule)).toBe(
      "Wheel sessions run 1 to 7 pm, every day except Monday and Tuesday. Book an hour or three.",
    );
  });

  it("keeps a weekday's capital and offers only the tiers there are", () => {
    const schedule = toStudioSchedule(wheel([0, 1, 2, 3, 4, 5], [2]));
    expect(schedule && toStudioNote(schedule)).toBe(
      "Wheel sessions run 1 to 7 pm, Saturdays only. Book two hours.",
    );
  });
});

describe("toStudioSection", () => {
  const OPEN_LINE =
    "Nothing coming up on the calendar, but the wheels keep their usual hours. Pick a time and we will set one up for you.";
  const RESTING_LINE =
    "Nothing coming up on the calendar, and the wheels are resting for now. Write to us and we will tell you when they turn again.";

  it("puts the wheel's note beside listed events and no teaser", () => {
    expect(toStudioSection(wheel([1]), true)).toEqual({
      note: "Wheel sessions run 1 to 7 pm, every day except Monday. Book an hour or three.",
      teaser: null,
    });
  });

  it("drops the note beside events when the wheel cannot be booked", () => {
    expect(toStudioSection(null, true)).toEqual({ note: null, teaser: null });
    expect(toStudioSection(wheel([], []), true)).toEqual({
      note: null,
      teaser: null,
    });
  });

  it("hands an empty calendar to the wheel's facts and booking link", () => {
    expect(toStudioSection(wheel([1]), false)).toEqual({
      note: null,
      teaser: {
        line: OPEN_LINE,
        hoursLabel: "1 to 7 pm",
        daysLabel: "Every day except Monday",
        priceLabel: "From ₹1,100 a person for an hour",
        href: "/workshops",
        linkLabel: "Book a wheel session",
      },
    });
  });

  it("goes quiet and points to contact when nothing can be booked", () => {
    const resting = {
      note: null,
      teaser: {
        line: RESTING_LINE,
        hoursLabel: null,
        daysLabel: null,
        priceLabel: null,
        href: "/contact",
        linkLabel: "Write to us",
      },
    };
    expect(toStudioSection(null, false)).toEqual(resting);
    expect(toStudioSection(wheel([], []), false)).toEqual(resting);
    expect(toStudioSection(wheel([0, 1, 2, 3, 4, 5, 6]), false)).toEqual(
      resting,
    );
  });
});
