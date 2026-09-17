import { describe, expect, it } from "vitest";

import { CouponKind } from "@/graphql/generated/graphql";

import {
  applyCouponPatch,
  couponStatusLabel,
  couponStatusTone,
  type CouponRow,
  describeCouponDeletion,
  describeCouponWindow,
  describeUses,
  formatCouponValue,
  formatMinOrder,
  readActiveFilter,
  toCouponRow,
} from "./types";

function rows(): CouponRow[] {
  return [
    {
      id: 1,
      code: "MONSOON20",
      kind: CouponKind.Percent,
      value: 20,
      minOrder: 1000,
      maxUses: 50,
      usesCount: 3,
      startsAt: null,
      expiresAt: null,
      isActive: true,
    },
    {
      id: 2,
      code: "FLAT200",
      kind: CouponKind.Fixed,
      value: 200,
      minOrder: 0,
      maxUses: null,
      usesCount: 0,
      startsAt: null,
      expiresAt: null,
      isActive: false,
    },
  ];
}

describe("formatCouponValue", () => {
  it("writes a percentage as a percentage and a flat cut as rupees", () => {
    expect(formatCouponValue(CouponKind.Percent, 20)).toBe("20%");
    expect(formatCouponValue(CouponKind.Fixed, 200)).toBe("₹200");
  });
});

describe("formatMinOrder", () => {
  it("says any order when there is no floor", () => {
    expect(formatMinOrder(0)).toBe("Any order");
    expect(formatMinOrder(1000)).toBe("₹1,000");
  });
});

describe("describeUses", () => {
  it("counts against the cap, or says there is none", () => {
    expect(describeUses(3, 50)).toBe("3 of 50");
    expect(describeUses(3, null)).toBe("3 of unlimited");
  });
});

describe("describeCouponWindow", () => {
  it("calls an open window always on", () => {
    expect(describeCouponWindow(null, null)).toBe("Always on");
  });

  it("names whichever end is set", () => {
    expect(describeCouponWindow("2026-06-01T03:30:00.000Z", null)).toBe(
      "From Mon, 1 Jun, 2026",
    );
    expect(describeCouponWindow(null, "2026-08-31T03:30:00.000Z")).toBe(
      "Until Mon, 31 Aug, 2026",
    );
  });

  it("joins both ends with an arrow", () => {
    expect(
      describeCouponWindow(
        "2026-06-01T03:30:00.000Z",
        "2026-08-31T03:30:00.000Z",
      ),
    ).toBe("Mon, 1 Jun, 2026 → Mon, 31 Aug, 2026");
  });
});

describe("coupon status", () => {
  it("keeps the pill quiet while a code is paused", () => {
    expect(couponStatusTone(true)).toBe("live");
    expect(couponStatusTone(false)).toBe("quiet");
    expect(couponStatusLabel(true)).toBe("Active");
    expect(couponStatusLabel(false)).toBe("Paused");
  });
});

describe("readActiveFilter", () => {
  it("only reads the two words it writes", () => {
    expect(readActiveFilter("true")).toBe(true);
    expect(readActiveFilter("false")).toBe(false);
    expect(readActiveFilter(undefined)).toBeUndefined();
    expect(readActiveFilter("")).toBeUndefined();
    expect(readActiveFilter("yes")).toBeUndefined();
  });
});

describe("toCouponRow", () => {
  it("renames the API fields once, at the edge", () => {
    const row = toCouponRow({
      id: 9,
      code: "WELCOME",
      kind: CouponKind.Fixed,
      value: 150,
      min_order: 500,
      max_uses: null,
      uses_count: 2,
      starts_at: null,
      expires_at: "2026-08-31T03:30:00.000Z",
      is_active: true,
    });
    expect(row.minOrder).toBe(500);
    expect(row.maxUses).toBeNull();
    expect(row.usesCount).toBe(2);
    expect(row.expiresAt).toBe("2026-08-31T03:30:00.000Z");
  });
});

describe("applyCouponPatch", () => {
  it("replaces a row it already knows", () => {
    const saved = { ...rows()[0], value: 25, isActive: false };
    const next = applyCouponPatch(rows(), { kind: "save", row: saved });
    expect(next).toHaveLength(2);
    expect(next[0].value).toBe(25);
    expect(next[0].isActive).toBe(false);
  });

  it("puts a brand new code at the top of the page", () => {
    const created = { ...rows()[0], id: 99, code: "NEW10" };
    const next = applyCouponPatch(rows(), { kind: "save", row: created });
    expect(next.map((row) => row.id)).toEqual([99, 1, 2]);
  });

  it("drops a deleted row", () => {
    const next = applyCouponPatch(rows(), { kind: "remove", id: 1 });
    expect(next.map((row) => row.id)).toEqual([2]);
  });
});

describe("describeCouponDeletion", () => {
  it("mentions how often the code has been typed", () => {
    expect(describeCouponDeletion("MONSOON20", 0)).toBe(
      "MONSOON20 has never been used. Deleting it cannot be undone.",
    );
    expect(describeCouponDeletion("MONSOON20", 1)).toContain("used once");
    expect(describeCouponDeletion("MONSOON20", 4)).toContain("used 4 times");
  });
});
