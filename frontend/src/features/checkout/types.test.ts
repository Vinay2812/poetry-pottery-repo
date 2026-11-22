import { describe, expect, it } from "vitest";

import {
  GIFT_NOTE_MAX_LENGTH,
  QUOTE_FAILED_REASON,
  toBlockedReason,
  toCouponView,
  toGiftView,
  toQuoteState,
} from "./types";

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

describe("toQuoteState", () => {
  it("is checking while the quote is in flight, even with an older one on screen", () => {
    expect(toQuoteState(true, false, true)).toBe("checking");
  });

  it("is ready only when a quote came back without an error", () => {
    expect(toQuoteState(true, false, false)).toBe("ready");
  });

  it("fails when the quote errored or never arrived", () => {
    expect(toQuoteState(false, true, false)).toBe("failed");
    expect(toQuoteState(false, false, false)).toBe("failed");
  });
});

describe("toBlockedReason", () => {
  const ready = {
    hasAddress: true,
    itemCount: 2,
    problemCount: 0,
    quoteState: "ready",
  } as const;

  it("lets a quoted cart with an address through", () => {
    expect(toBlockedReason(ready)).toBeNull();
  });

  it("puts a failed quote ahead of everything else", () => {
    expect(
      toBlockedReason({ ...ready, hasAddress: false, quoteState: "failed" }),
    ).toBe(QUOTE_FAILED_REASON);
  });

  it("asks for an address, then pieces, then a clean cart", () => {
    expect(toBlockedReason({ ...ready, hasAddress: false })).toBe(
      "Choose a delivery address to continue.",
    );
    expect(toBlockedReason({ ...ready, itemCount: 0 })).toBe(
      "Your cart is empty.",
    );
    expect(toBlockedReason({ ...ready, problemCount: 1 })).toBe(
      "Remove the unavailable pieces from your cart first.",
    );
  });

  it("has no reason while the quote is still checking", () => {
    expect(toBlockedReason({ ...ready, quoteState: "checking" })).toBeNull();
  });
});
