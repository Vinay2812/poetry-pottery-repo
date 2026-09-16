import { describe, expect, it } from "vitest";

import {
  applyCartAction,
  canPredictShipping,
  type CartData,
  toFreeShippingProgress,
  toMaxQuantity,
  toSelectionSummary,
} from "./types";

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

  it("names the group even when nothing was chosen under it", () => {
    expect(
      toSelectionSummary([
        {
          group_id: 3,
          group_name: "Glaze",
          option_id: null,
          option_name: null,
          text: null,
          price_modifier: 0,
        },
      ]),
    ).toBe("Glaze: ");
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

function line(
  id: number,
  unitPrice: number,
  quantity: number,
  isAvailable = true,
): CartData["items"][number] {
  return {
    id,
    quantity,
    unit_price: unitPrice,
    line_total: unitPrice * quantity,
    is_available: isAvailable,
    unavailable_reason: null,
    selections: [],
    reference_image_urls: [],
    product: {
      id,
      slug: `piece-${id}`,
      name: `Piece ${id}`,
      price: unitPrice,
      compare_at_price: null,
      material: "Stoneware",
      color_name: null,
      color_code: null,
      image_urls: [],
      stock: 10,
      is_active: true,
      is_archived: false,
      is_featured: false,
      is_customizable: false,
      rating_avg: 0,
      rating_count: 0,
      collection: null,
    },
  };
}

function cart(overrides: Partial<CartData> = {}): CartData {
  const items = [line(1, 1000, 2), line(2, 500, 1)];
  return {
    item_count: 3,
    subtotal: 2500,
    shipping_fee: 120,
    free_shipping_above: null,
    total: 2620,
    items,
    ...overrides,
  };
}

describe("applyCartAction", () => {
  it("re-totals the cart when a quantity changes", () => {
    const next = applyCartAction(cart(), {
      kind: "quantity",
      id: 1,
      quantity: 3,
    });
    expect(next?.item_count).toBe(4);
    expect(next?.subtotal).toBe(3500);
    expect(next?.total).toBe(3620);
  });

  it("drops a line whose quantity falls to nothing", () => {
    const next = applyCartAction(cart(), {
      kind: "quantity",
      id: 2,
      quantity: 0,
    });
    expect(next?.items.map((item) => item.id)).toEqual([1]);
    expect(next?.subtotal).toBe(2000);
  });

  it("takes a line out", () => {
    const next = applyCartAction(cart(), { kind: "remove", id: 1 });
    expect(next?.items.map((item) => item.id)).toEqual([2]);
    expect(next?.item_count).toBe(1);
  });

  it("empties the cart and stops charging for shipping", () => {
    const next = applyCartAction(cart(), { kind: "clear" });
    expect(next?.items).toEqual([]);
    expect(next?.item_count).toBe(0);
    expect(next?.shipping_fee).toBe(0);
    expect(next?.total).toBe(0);
  });

  it("leaves unavailable lines out of the subtotal but keeps them listed", () => {
    const current = cart({ items: [line(1, 1000, 2), line(2, 500, 1, false)] });
    const next = applyCartAction(current, {
      kind: "quantity",
      id: 1,
      quantity: 1,
    });
    expect(next?.items).toHaveLength(2);
    expect(next?.subtotal).toBe(1000);
  });

  it("keeps free shipping once the cart is over the threshold", () => {
    const current = cart({
      free_shipping_above: 2000,
      shipping_fee: 0,
      total: 2500,
    });
    const next = applyCartAction(current, {
      kind: "quantity",
      id: 1,
      quantity: 3,
    });
    expect(next?.shipping_fee).toBe(0);
    expect(next?.total).toBe(3500);
  });

  it("waits for the server when the fee cannot be worked out", () => {
    const current = cart({
      free_shipping_above: 2000,
      shipping_fee: 0,
      total: 2500,
    });
    expect(
      applyCartAction(current, { kind: "quantity", id: 1, quantity: 1 }),
    ).toBe(current);
  });

  it("leaves the cart it was given alone", () => {
    const current = cart();
    applyCartAction(current, { kind: "clear" });
    expect(current.items).toHaveLength(2);
  });

  it("has nothing to do before the cart loads", () => {
    expect(applyCartAction(null, { kind: "clear" })).toBeNull();
  });
});

describe("toFreeShippingProgress", () => {
  const rupees = (amount: number) => `Rs${amount}`;

  it("names the gap left to close", () => {
    expect(toFreeShippingProgress(600, 2500, rupees)).toEqual({
      hasEarnedIt: false,
      percent: 24,
      label: "Rs1900 more for free shipping.",
    });
  });

  it("confirms free shipping in one line once the threshold is met", () => {
    expect(toFreeShippingProgress(2500, 2500, rupees)).toEqual({
      hasEarnedIt: true,
      percent: 100,
      label: "Shipping is free on this order.",
    });
    expect(toFreeShippingProgress(0, 0, rupees).hasEarnedIt).toBe(true);
  });
});
