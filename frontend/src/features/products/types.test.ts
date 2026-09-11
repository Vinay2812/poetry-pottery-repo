import { describe, expect, it } from "vitest";

import { OptionGroupKind, ProductSort } from "@/graphql/generated/graphql";

import {
  computeUnitPrice,
  countActiveFilters,
  EMPTY_FILTERS,
  parseFilters,
  toDiscountPercent,
  toSearchParams,
  toStockStatus,
  validateSelections,
  type ProductOptionGroupData,
} from "./types";

const groups: ProductOptionGroupData[] = [
  {
    id: 1,
    name: "Size",
    kind: OptionGroupKind.Choice,
    is_required: true,
    price_modifier: 0,
    max_length: null,
    options: [
      { id: 10, name: "Regular", price_modifier: 0 },
      { id: 11, name: "Large", price_modifier: 150 },
    ],
  },
  {
    id: 2,
    name: "Carved text",
    kind: OptionGroupKind.Text,
    is_required: true,
    price_modifier: 100,
    max_length: 5,
    options: [],
  },
];

describe("filters round-trip", () => {
  it("parses and serialises the same URL", () => {
    const params = new URLSearchParams(
      "q=mug&category=mugs,bowls&material=Stoneware&min=500&max=2000&in_stock=1&sort=NEWEST",
    );
    const filters = parseFilters(params);

    expect(filters).toEqual({
      ...EMPTY_FILTERS,
      search: "mug",
      categories: ["mugs", "bowls"],
      materials: ["Stoneware"],
      minPrice: 500,
      maxPrice: 2000,
      inStockOnly: true,
      sort: ProductSort.Newest,
    });
    expect(toSearchParams(filters).toString()).toBe(
      "q=mug&category=mugs%2Cbowls&material=Stoneware&min=500&max=2000&in_stock=1&sort=NEWEST",
    );
  });

  it("ignores junk values", () => {
    const filters = parseFilters(
      new URLSearchParams("sort=BOGUS&min=-4&max=abc"),
    );
    expect(filters.sort).toBe(ProductSort.Featured);
    expect(filters.minPrice).toBeNull();
    expect(filters.maxPrice).toBeNull();
  });

  it("counts active filters excluding search and sort", () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
    expect(
      countActiveFilters({
        ...EMPTY_FILTERS,
        categories: ["mugs"],
        minPrice: 100,
        inStockOnly: true,
        sort: ProductSort.Newest,
        search: "x",
      }),
    ).toBe(3);
  });
});

describe("toDiscountPercent", () => {
  it("rounds the saving and ignores non-discounts", () => {
    expect(toDiscountPercent(850, 950)).toBe(11);
    expect(toDiscountPercent(850, 850)).toBeNull();
    expect(toDiscountPercent(850, null)).toBeNull();
  });
});

describe("toStockStatus", () => {
  it("labels stock levels", () => {
    expect(toStockStatus(0, false)).toEqual({
      tone: "sold_out",
      label: "Sold out",
    });
    expect(toStockStatus(3, false)).toEqual({
      tone: "low",
      label: "Only 3 left",
    });
    expect(toStockStatus(20, false)).toEqual({
      tone: "in_stock",
      label: "In stock",
    });
    expect(toStockStatus(0, true).tone).toBe("made_to_order");
  });
});

describe("customisation pricing", () => {
  it("adds option and text modifiers", () => {
    expect(computeUnitPrice(950, groups, {})).toBe(950);
    expect(computeUnitPrice(950, groups, { 1: { optionId: 11 } })).toBe(1100);
    expect(
      computeUnitPrice(950, groups, {
        1: { optionId: 11 },
        2: { text: "Maya" },
      }),
    ).toBe(1200);
    expect(computeUnitPrice(950, groups, { 2: { text: "   " } })).toBe(950);
  });

  it("reports missing and overlong selections", () => {
    expect(validateSelections(groups, {})).toEqual([
      { groupId: 1, message: "Choose a size" },
      { groupId: 2, message: "Add your carved text" },
    ]);
    expect(
      validateSelections(groups, {
        1: { optionId: 10 },
        2: { text: "Toolong" },
      }),
    ).toEqual([{ groupId: 2, message: "Keep it under 5 characters" }]);
    expect(
      validateSelections(groups, { 1: { optionId: 10 }, 2: { text: "Maya" } }),
    ).toEqual([]);
  });
});
