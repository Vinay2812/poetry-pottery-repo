import { describe, expect, it } from "vitest";

import { CouponKind } from "@/graphql/generated/graphql";

import { adminCouponSchema } from "./coupon";

function values(overrides: Record<string, unknown> = {}) {
  return {
    code: "MONSOON20",
    kind: CouponKind.Percent,
    value: "20",
    min_order: "1000",
    max_uses: "50",
    starts_at: "2026-06-01T09:00",
    expires_at: "2026-08-31T18:00",
    is_active: true,
    ...overrides,
  };
}

function firstError(overrides: Record<string, unknown>): string {
  const result = adminCouponSchema.safeParse(values(overrides));
  return result.success ? "" : (result.error.issues[0]?.message ?? "");
}

describe("adminCouponSchema", () => {
  it("trims and uppercases the code", () => {
    const result = adminCouponSchema.parse(values({ code: "  monsoon-20 " }));
    expect(result.code).toBe("MONSOON-20");
  });

  it("holds the code between three and twenty-four characters", () => {
    expect(firstError({ code: "AB" })).toBe(
      "Code must be at least 3 characters",
    );
    expect(firstError({ code: "A".repeat(25) })).toBe(
      "Code must be 24 characters or fewer",
    );
  });

  it("turns away punctuation in the code", () => {
    expect(firstError({ code: "MONSOON 20" })).toBe(
      "Code can only use letters, digits and dashes",
    );
    expect(firstError({ code: "MONSOON_20" })).toBe(
      "Code can only use letters, digits and dashes",
    );
  });

  it("keeps a percentage between one and a hundred", () => {
    expect(firstError({ value: "0" })).toBe(
      "A percentage has to be between 1 and 100",
    );
    expect(firstError({ value: "101" })).toBe(
      "A percentage has to be between 1 and 100",
    );
    expect(adminCouponSchema.safeParse(values({ value: "100" })).success).toBe(
      true,
    );
  });

  it("wants a flat discount worth at least a rupee", () => {
    expect(firstError({ kind: CouponKind.Fixed, value: "0" })).toBe(
      "A flat discount has to be at least 1 rupee",
    );
    expect(
      adminCouponSchema.safeParse(
        values({ kind: CouponKind.Fixed, value: "1" }),
      ).success,
    ).toBe(true);
  });

  it("lets a flat discount run past a hundred rupees", () => {
    expect(
      adminCouponSchema.safeParse(
        values({ kind: CouponKind.Fixed, value: "250" }),
      ).success,
    ).toBe(true);
  });

  it("only takes whole non-negative numbers", () => {
    expect(firstError({ value: "-5" })).toBe("Value must be a whole number");
    expect(firstError({ min_order: "-1" })).toBe(
      "Minimum order must be a whole number",
    );
    expect(firstError({ max_uses: "1.5" })).toBe(
      "Maximum uses must be a whole number",
    );
  });

  it("reads an empty maximum as no limit", () => {
    expect(adminCouponSchema.safeParse(values({ max_uses: "" })).success).toBe(
      true,
    );
  });

  it("rejects an expiry that lands before the start", () => {
    expect(firstError({ expires_at: "2026-05-01T09:00" })).toBe(
      "The expiry has to come after the start",
    );
    expect(firstError({ expires_at: "2026-06-01T09:00" })).toBe(
      "The expiry has to come after the start",
    );
  });

  it("accepts an open-ended window", () => {
    expect(
      adminCouponSchema.safeParse(values({ starts_at: "", expires_at: "" }))
        .success,
    ).toBe(true);
  });
});
