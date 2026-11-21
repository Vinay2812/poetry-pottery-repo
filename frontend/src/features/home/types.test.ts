import { describe, expect, it } from "vitest";

import {
  toStudioDaysLabel,
  toStudioFacts,
  toStudioNote,
  toStudioHoursLabel,
  toStudioPriceLabel,
} from "./types";

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
    expect(toStudioDaysLabel([1])).toBe("Every day but Monday");
  });

  it("lists several closed days in week order without repeats", () => {
    expect(toStudioDaysLabel([3, 1, 1])).toBe("Closed Monday and Wednesday");
    expect(toStudioDaysLabel([1, 2, 3])).toBe(
      "Closed Monday, Tuesday and Wednesday",
    );
  });

  it("turns a single open day around", () => {
    expect(toStudioDaysLabel([0, 1, 2, 3, 4, 5])).toBe("Saturdays only");
    expect(toStudioDaysLabel([0, 1, 2, 3, 4, 5, 6])).toBe("By appointment");
  });
});

describe("toStudioPriceLabel", () => {
  it("reads the shortest tier whatever the order", () => {
    expect(
      toStudioPriceLabel([
        { hours: 3, price_per_person: 2700 },
        { hours: 1, price_per_person: 1100 },
      ]),
    ).toBe("From ₹1,100 a person for an hour");
    expect(toStudioPriceLabel([{ hours: 2, price_per_person: 2000 }])).toBe(
      "From ₹2,000 a person for 2 hours",
    );
  });

  it("has nothing to say without tiers", () => {
    expect(toStudioPriceLabel([])).toBeNull();
  });
});

const WHEEL = {
  opening_minutes: 780,
  closing_minutes: 1140,
  closed_weekdays: [1],
  tiers: [{ hours: 1, price_per_person: 1100 }],
};

describe("toStudioFacts", () => {
  it("reads hours, days and price off the wheel", () => {
    expect(toStudioFacts(WHEEL)).toEqual({
      hoursLabel: "1 to 7 pm",
      daysLabel: "Every day but Monday",
      priceLabel: "From ₹1,100 a person for an hour",
    });
  });

  it("falls back to the usual afternoons without a wheel", () => {
    expect(toStudioFacts(null)).toEqual({
      hoursLabel: "Afternoons",
      daysLabel: "Every day but Monday",
      priceLabel: null,
    });
  });
});

describe("toStudioNote", () => {
  it("names the wheel's hours and days mid-sentence", () => {
    expect(toStudioNote(WHEEL)).toBe(
      "Wheel sessions run 1 to 7 pm, every day but Monday. Book an hour or three.",
    );
    expect(
      toStudioNote({ ...WHEEL, closed_weekdays: [0, 1, 2, 3, 4, 5] }),
    ).toBe(
      "Wheel sessions run 1 to 7 pm, Saturdays only. Book an hour or three.",
    );
  });

  it("keeps the usual line without a wheel", () => {
    expect(toStudioNote(null)).toBe(
      "Wheel sessions run every afternoon except Monday. Book an hour or three.",
    );
  });
});
