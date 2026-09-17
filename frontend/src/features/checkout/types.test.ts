import { describe, expect, it } from "vitest";

import { GIFT_NOTE_MAX_LENGTH, toCouponView, toGiftView } from "./types";

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

describe("toGiftView", () => {
  it("carries a trimmed message and the wish that goes with it", () => {
    expect(toGiftView(true, "  For Ma  ", true)).toEqual({
      gift_note: "For Ma",
      hide_prices: true,
    });
  });

  it("cuts a long message to what fits on the card", () => {
    const long = "a".repeat(GIFT_NOTE_MAX_LENGTH + 30);

    expect(toGiftView(true, long, false).gift_note).toHaveLength(
      GIFT_NOTE_MAX_LENGTH,
    );
  });

  it("drops everything once the gift box is unticked", () => {
    expect(toGiftView(false, "For Ma", true)).toEqual({
      gift_note: null,
      hide_prices: false,
    });
  });

  it("still hides prices on a gift sent without a message", () => {
    expect(toGiftView(true, "   ", true)).toEqual({
      gift_note: null,
      hide_prices: true,
    });
  });
});
