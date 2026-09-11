import { describe, expect, it } from "vitest";

import { formatDate, formatInr, formatTime, pluralize } from "./format";

describe("formatInr", () => {
  it("formats rupees with Indian grouping and no decimals", () => {
    expect(formatInr(125000)).toBe("₹1,25,000");
    expect(formatInr(850)).toBe("₹850");
  });
});

describe("pluralize", () => {
  it("picks the singular for one", () => {
    expect(pluralize(1, "piece")).toBe("1 piece");
    expect(pluralize(3, "piece")).toBe("3 pieces");
    expect(pluralize(0, "box", "boxes")).toBe("0 boxes");
  });
});

describe("dates", () => {
  it("renders in Indian time", () => {
    const value = "2026-10-03T09:30:00.000Z";
    expect(formatDate(value)).toBe("Sat, 3 Oct, 2026");
    expect(formatTime(value)).toBe("3:00 pm");
  });
});
