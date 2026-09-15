import { describe, expect, it } from "vitest";

import {
  type AdminOptionGroupFieldsFragment,
  type AdminProductDetailFragment,
  OptionGroupKind,
} from "@/graphql/generated/graphql";

import {
  applyStockDelta,
  clampStock,
  describeCategories,
  describeMaxLength,
  describeOptionGroup,
  EMPTY_PRODUCT_FORM,
  formatCareNotes,
  formatPriceModifier,
  formatSortOrder,
  formatStock,
  parseCareNotes,
  PIECES_PAGE_SIZE,
  sortOptionGroups,
  toOptionGroupFormValues,
  toOptionGroupInput,
  toProductFormValues,
  toProductInput,
  toProductsFilter,
  toProductUpdateInput,
} from "./types";

const PRODUCT: AdminProductDetailFragment = {
  id: 7,
  slug: "slate-morning-mug",
  name: "Slate morning mug",
  price: 1200,
  compare_at_price: 1500,
  stock: 4,
  is_active: true,
  is_featured: false,
  is_archived: false,
  is_customizable: true,
  image_urls: ["https://cdn.test/one.jpg"],
  material: "Stoneware",
  description: "Thrown on the wheel.",
  dimensions: "9 cm × 8 cm",
  color_name: "Slate",
  color_code: "#4F6F52",
  care_notes: ["Hand wash", "No microwave"],
  created_at: "2026-01-01T00:00:00.000Z",
  sales_count: 12,
  option_groups: [],
  categories: [
    { id: 1, name: "Mugs", slug: "mugs" },
    { id: 2, name: "Everyday", slug: "everyday" },
  ],
  collection: { id: 3, name: "Winter", slug: "winter" },
};

function group(id: number, sortOrder: number): AdminOptionGroupFieldsFragment {
  return {
    id,
    name: `Group ${id}`,
    kind: OptionGroupKind.Choice,
    is_required: false,
    max_length: null,
    price_modifier: 0,
    sort_order: sortOrder,
    options: [],
  };
}

describe("parseCareNotes", () => {
  it("makes one note per line and drops the blanks", () => {
    expect(parseCareNotes("Hand wash\n\n  No microwave  \n")).toEqual([
      "Hand wash",
      "No microwave",
    ]);
  });

  it("returns nothing for an empty box", () => {
    expect(parseCareNotes("   ")).toEqual([]);
  });
});

describe("formatCareNotes", () => {
  it("round trips back into the textarea", () => {
    const notes = ["Hand wash", "No microwave"];
    expect(parseCareNotes(formatCareNotes(notes))).toEqual(notes);
  });
});

describe("clampStock", () => {
  it("never reads below zero", () => {
    expect(clampStock(-4)).toBe(0);
    expect(clampStock(3)).toBe(3);
  });
});

describe("applyStockDelta", () => {
  it("moves the count and stops at zero", () => {
    expect(applyStockDelta(4, 2)).toBe(6);
    expect(applyStockDelta(1, -5)).toBe(0);
  });
});

describe("formatStock", () => {
  it("prints the clamped count", () => {
    expect(formatStock(-2)).toBe("0");
    expect(formatStock(12)).toBe("12");
  });
});

describe("describeCategories", () => {
  it("joins names and falls back to a dash", () => {
    expect(describeCategories(["Mugs", "Bowls"])).toBe("Mugs, Bowls");
    expect(describeCategories([])).toBe("—");
  });
});

describe("formatPriceModifier", () => {
  it("signs the change and says when there is none", () => {
    expect(formatPriceModifier(0)).toBe("No change");
    expect(formatPriceModifier(200)).toBe("+₹200");
    expect(formatPriceModifier(-150)).toBe("−₹150");
  });
});

describe("describeOptionGroup", () => {
  it("counts choices and names free text", () => {
    expect(describeOptionGroup(OptionGroupKind.Choice, 1, true)).toBe(
      "Choice · 1 option · required",
    );
    expect(describeOptionGroup(OptionGroupKind.Text, 0, false)).toBe(
      "Text · Free text · optional",
    );
  });
});

describe("formatSortOrder", () => {
  it("names the place in the list", () => {
    expect(formatSortOrder(2)).toBe("Order 2");
  });
});

describe("describeMaxLength", () => {
  it("says nothing when there is no limit", () => {
    expect(describeMaxLength(null)).toBeNull();
    expect(describeMaxLength(1)).toBe("Up to 1 character");
    expect(describeMaxLength(24)).toBe("Up to 24 characters");
  });
});

describe("sortOptionGroups", () => {
  it("orders by sort order then id without touching the input", () => {
    const groups = [group(2, 1), group(1, 0), group(3, 1)];
    expect(sortOptionGroups(groups).map((item) => item.id)).toEqual([1, 2, 3]);
    expect(groups.map((item) => item.id)).toEqual([2, 1, 3]);
  });
});

describe("toProductsFilter", () => {
  it("reads every filter out of the URL", () => {
    expect(
      toProductsFilter(
        {
          search: "mug",
          category_id: "4",
          collection_id: "9",
          is_active: "0",
          is_featured: "1",
          low_stock: "1",
        },
        3,
      ),
    ).toEqual({
      page: 3,
      limit: PIECES_PAGE_SIZE,
      search: "mug",
      category_id: 4,
      collection_id: 9,
      is_active: false,
      is_featured: true,
      low_stock: true,
    });
  });

  it("leaves anything unset out of the query", () => {
    expect(toProductsFilter({}, 1)).toEqual({
      page: 1,
      limit: PIECES_PAGE_SIZE,
      search: null,
      category_id: null,
      collection_id: null,
      is_active: null,
      is_featured: null,
      low_stock: null,
    });
  });

  it("ignores a category id that is not a positive number", () => {
    const filter = toProductsFilter({ category_id: "all" }, 1);
    expect(filter.category_id).toBeNull();
  });
});

describe("toProductFormValues", () => {
  it("fills the form from a saved piece", () => {
    expect(toProductFormValues(PRODUCT)).toEqual({
      name: "Slate morning mug",
      description: "Thrown on the wheel.",
      price: 1200,
      compare_at_price: 1500,
      material: "Stoneware",
      dimensions: "9 cm × 8 cm",
      color_name: "Slate",
      color_code: "#4F6F52",
      stock: 4,
      care_notes: "Hand wash\nNo microwave",
      category_ids: [1, 2],
      collection_id: 3,
      is_customizable: true,
      is_featured: false,
      is_active: true,
    });
  });

  it("turns missing text into empty boxes", () => {
    const values = toProductFormValues({
      ...PRODUCT,
      dimensions: null,
      color_name: null,
      color_code: null,
      collection: null,
    });
    expect(values.dimensions).toBe("");
    expect(values.color_name).toBe("");
    expect(values.color_code).toBe("");
    expect(values.collection_id).toBeNull();
  });
});

describe("toProductInput", () => {
  it("trims text, splits the notes and carries the photos", () => {
    const input = toProductInput(
      {
        ...EMPTY_PRODUCT_FORM,
        name: "  Slate morning mug  ",
        description: " Thrown on the wheel. ",
        material: " Stoneware ",
        care_notes: "Hand wash\n\nNo microwave",
        is_featured: true,
      },
      ["https://cdn.test/one.jpg"],
    );
    expect(input.name).toBe("Slate morning mug");
    expect(input.description).toBe("Thrown on the wheel.");
    expect(input.material).toBe("Stoneware");
    expect(input.care_notes).toEqual(["Hand wash", "No microwave"]);
    expect(input.image_urls).toEqual(["https://cdn.test/one.jpg"]);
    expect(input.is_featured).toBe(true);
  });

  it("sends nothing rather than an empty string for optional text", () => {
    const input = toProductInput(EMPTY_PRODUCT_FORM, []);
    expect(input.dimensions).toBeNull();
    expect(input.color_name).toBeNull();
    expect(input.color_code).toBeNull();
  });
});

describe("toProductUpdateInput", () => {
  it("leaves active and featured to their own mutations", () => {
    const input = toProductUpdateInput(
      { ...EMPTY_PRODUCT_FORM, name: "Kiln bowl", is_featured: true },
      [],
    );
    expect(input.name).toBe("Kiln bowl");
    expect(input).not.toHaveProperty("is_featured");
    expect(input).not.toHaveProperty("is_active");
  });
});

describe("toOptionGroupInput", () => {
  it("keeps a length only on a text group", () => {
    expect(
      toOptionGroupInput({
        name: "Carved name",
        kind: OptionGroupKind.Text,
        is_required: true,
        sort_order: 1,
        price_modifier: 200,
        max_length: 12,
      }).max_length,
    ).toBe(12);

    expect(
      toOptionGroupInput({
        name: "Handle",
        kind: OptionGroupKind.Choice,
        is_required: false,
        sort_order: 0,
        price_modifier: 0,
        max_length: 12,
      }).max_length,
    ).toBeNull();
  });
});

describe("toOptionGroupFormValues", () => {
  it("fills the editor from a saved group", () => {
    expect(toOptionGroupFormValues(group(5, 2))).toEqual({
      name: "Group 5",
      kind: OptionGroupKind.Choice,
      is_required: false,
      sort_order: 2,
      price_modifier: 0,
      max_length: null,
    });
  });
});
