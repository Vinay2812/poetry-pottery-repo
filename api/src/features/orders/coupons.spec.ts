import { CouponKind, type Coupon } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { checkCoupon, couponDiscount, normaliseCouponCode } from "./coupons";

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    id: 1,
    code: "WELCOME10",
    kind: CouponKind.PERCENT,
    value: 10,
    min_order: 1000,
    max_uses: null,
    uses_count: 0,
    starts_at: null,
    expires_at: null,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

describe("couponDiscount", () => {
  it("floors percentages and caps fixed amounts at the subtotal", () => {
    expect(couponDiscount({ kind: CouponKind.PERCENT, value: 10 }, 1255)).toBe(
      125,
    );
    expect(couponDiscount({ kind: CouponKind.FIXED, value: 500 }, 300)).toBe(
      300,
    );
  });
});

describe("checkCoupon", () => {
  const now = new Date("2026-09-12T00:00:00.000Z");

  it("accepts a live coupon above the minimum", () => {
    expect(checkCoupon(coupon(), 2000, now)).toEqual({
      ok: true,
      discount: 200,
    });
  });

  it("explains each rejection", () => {
    expect(checkCoupon(null, 2000, now)).toMatchObject({ ok: false });
    expect(checkCoupon(coupon({ is_active: false }), 2000, now)).toMatchObject({
      ok: false,
    });
    expect(
      checkCoupon(coupon({ expires_at: new Date("2026-01-01") }), 2000, now),
    ).toMatchObject({ message: "That code has expired" });
    expect(
      checkCoupon(coupon({ starts_at: new Date("2027-01-01") }), 2000, now),
    ).toMatchObject({ message: "That code is not active yet" });
    expect(
      checkCoupon(coupon({ max_uses: 5, uses_count: 5 }), 2000, now),
    ).toMatchObject({ message: "That code has been fully redeemed" });
    expect(checkCoupon(coupon(), 800, now)).toMatchObject({
      message: "Add ₹200 more to use this code",
    });
  });
});

describe("normaliseCouponCode", () => {
  it("upper-cases and drops blanks", () => {
    expect(normaliseCouponCode(" welcome10 ")).toBe("WELCOME10");
    expect(normaliseCouponCode("   ")).toBeNull();
    expect(normaliseCouponCode(undefined)).toBeNull();
  });
});
