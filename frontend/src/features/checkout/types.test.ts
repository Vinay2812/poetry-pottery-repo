import { describe, expect, it } from "vitest";

import { toCouponView } from "./types";

describe("toCouponView", () => {
  it("shows nothing when no code is in play", () => {
    expect(
      toCouponView({ code: null, quoteCode: null, quoteDiscount: 0 }),
    ).toEqual({ code: null, discount: 0, isApplied: false, isPending: false });
  });

  it("marks an optimistic code as pending without inventing a discount", () => {
    expect(
      toCouponView({
        code: "WELCOME10",
        quoteCode: null,
        quoteDiscount: 0,
      }),
    ).toEqual({
      code: "WELCOME10",
      discount: 0,
      isApplied: true,
      isPending: true,
    });
  });

  it("shows the quoted discount once the server agrees on the code", () => {
    expect(
      toCouponView({
        code: "WELCOME10",
        quoteCode: "WELCOME10",
        quoteDiscount: 230,
      }),
    ).toEqual({
      code: "WELCOME10",
      discount: 230,
      isApplied: true,
      isPending: false,
    });
  });

  it("drops the discount the moment a code is removed", () => {
    expect(
      toCouponView({
        code: null,
        quoteCode: "WELCOME10",
        quoteDiscount: 230,
      }),
    ).toEqual({ code: null, discount: 0, isApplied: false, isPending: false });
  });

  it("keeps a swapped code pending against the old quote", () => {
    expect(
      toCouponView({
        code: "SPRING20",
        quoteCode: "WELCOME10",
        quoteDiscount: 230,
      }),
    ).toEqual({
      code: "SPRING20",
      discount: 0,
      isApplied: true,
      isPending: true,
    });
  });
});
