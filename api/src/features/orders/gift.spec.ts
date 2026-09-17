import { describe, expect, it } from "vitest";

import { GIFT_NOTE_MAX_LENGTH, readGift } from "./gift";

describe("readGift", () => {
  it("keeps a trimmed note and the wish that goes with it", () => {
    expect(readGift("  Happy birthday, Ma  ", true)).toEqual({
      gift_note: "Happy birthday, Ma",
      hide_prices: true,
    });
  });

  it("cuts a long note to what fits on the card", () => {
    const note = "a".repeat(GIFT_NOTE_MAX_LENGTH + 40);

    expect(readGift(note, false).gift_note).toHaveLength(GIFT_NOTE_MAX_LENGTH);
  });

  it("reads a blank or missing note as no gift at all", () => {
    expect(readGift("   ", false)).toEqual({
      gift_note: null,
      hide_prices: false,
    });
    expect(readGift(null, null)).toEqual({
      gift_note: null,
      hide_prices: false,
    });
  });

  it("hides prices on a gift that carries no message", () => {
    expect(readGift(null, true)).toEqual({
      gift_note: null,
      hide_prices: true,
    });
  });
});
