import { describe, expect, it } from "vitest";

import { canPredictShipping, toMaxQuantity, toSelectionSummary } from "./types";

describe("toSelectionSummary", () => {
  it("joins option and text choices", () => {
    expect(
      toSelectionSummary([
        {
          group_id: 1,
          group_name: "Size",
          option_id: 2,
          option_name: "Large",
          text: null,
          price_modifier: 150,
        },
        {
          group_id: 2,
          group_name: "Carved text",
          option_id: null,
          option_name: null,
          text: "Maya",
          price_modifier: 100,
        },
      ]),
    ).toBe("Size: Large · Carved text: Maya");
    expect(toSelectionSummary([])).toBeNull();
  });
});

describe("toMaxQuantity", () => {
  it("caps at stock for stocked pieces and at the cap for made-to-order", () => {
    expect(toMaxQuantity(3, false)).toBe(3);
    expect(toMaxQuantity(40, false)).toBe(10);
    expect(toMaxQuantity(0, true)).toBe(10);
    expect(toMaxQuantity(0, false)).toBe(1);
  });
});

describe("canPredictShipping", () => {
  it("only refuses to guess when a free-shipping cart drops back under the threshold", () => {
    expect(canPredictShipping(3000, 2600, 2500)).toBe(true);
    expect(canPredictShipping(3000, 0, 2500)).toBe(true);
    expect(canPredictShipping(2000, 1500, 2500)).toBe(true);
    expect(canPredictShipping(3000, 1200, null)).toBe(true);
    expect(canPredictShipping(3000, 1200, 2500)).toBe(false);
  });
});
