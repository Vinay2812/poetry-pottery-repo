import { describe, expect, it } from "vitest";

import {
  type AdminOptionGroupFieldsFragment,
  type AdminProductDetailFragment,
  OptionGroupKind,
} from "@/graphql/generated/graphql";

import {
  applyStockDelta,
  canGoLive,
  clampStock,
  countFoldedFilters,
  describeCategories,
  describeMaxLength,
  describeNewFeatureHint,
  describeKiln,
  describeKilnHint,
  describeFiltersToggle,
  describeOptionGroup,
  describePiecesEmpty,
  describeShelfState,
  describeShelfStateHint,
  describeStockAfter,
  describeUnsavedChanges,
  findFeatureBlock,
  findHomeShelfBlock,
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
  toFormBaseline,
  toProductUpdateInput,
  toStockDelta,
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
  is_second: false,
  flaw_note: null,
  is_commission: false,
  maker_note: "Thrown on a wet Tuesday.",
  capacity_ml: 300,
  height_cm: 9.5,
  diameter_cm: 8,
  weight_g: 420,
  glaze: { id: 4, name: "Kiln ash", color_code: "#6f7d6b" },
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
          is_second: "1",
          glaze_id: "5",
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
      is_second: true,
      glaze_id: 5,
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
      is_second: null,
      glaze_id: null,
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
      capacity_ml: 300,
      height_cm: 9.5,
      diameter_cm: 8,
      weight_g: 420,
      maker_note: "Thrown on a wet Tuesday.",
      category_ids: [1, 2],
      collection_id: 3,
      glaze_id: 4,
      is_customizable: true,
      is_second: false,
      flaw_note: "",
      is_commission: false,
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
        stock: 2,
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

  it("sends a piece that cannot go live as off the shelf and off the home page", () => {
    const input = toProductInput(
      { ...EMPTY_PRODUCT_FORM, stock: 0, is_active: true, is_featured: true },
      [],
    );
    expect(input.is_active).toBe(false);
    expect(input.is_featured).toBe(false);
  });

  it("keeps a made-to-order piece live with no stock, but off the home page", () => {
    const input = toProductInput(
      {
        ...EMPTY_PRODUCT_FORM,
        stock: 0,
        is_customizable: true,
        is_featured: true,
      },
      [],
    );
    expect(input.is_active).toBe(true);
    expect(input.is_featured).toBe(false);
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

  it("carries every measurement, the glaze and the kiln marks", () => {
    const input = toProductUpdateInput(
      {
        ...EMPTY_PRODUCT_FORM,
        capacity_ml: 320,
        height_cm: 9.5,
        diameter_cm: 8.2,
        weight_g: 430,
        maker_note: "  Thrown on a wet Tuesday.  ",
        glaze_id: 4,
        is_second: true,
        flaw_note: "Glaze crawl on the foot ring.",
        is_commission: true,
      },
      [],
    );
    expect(input).toMatchObject({
      capacity_ml: 320,
      height_cm: 9.5,
      diameter_cm: 8.2,
      weight_g: 430,
      maker_note: "Thrown on a wet Tuesday.",
      glaze_id: 4,
      is_second: true,
      flaw_note: "Glaze crawl on the foot ring.",
      is_commission: true,
    });
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

describe("canGoLive", () => {
  it("needs stock unless the piece is thrown to order", () => {
    expect(canGoLive(0, false)).toBe(false);
    expect(canGoLive(1, false)).toBe(true);
    expect(canGoLive(0, true)).toBe(true);
  });
});

describe("shelf state", () => {
  it("uses the storefront's words for a live and a retired piece", () => {
    expect(describeShelfState(true)).toBe("On the shelf");
    expect(describeShelfState(false)).toBe("Retired");
  });

  it("explains why a retired piece cannot go back yet", () => {
    expect(describeShelfStateHint(false, false, false, null)).toBe(
      "Add stock first, or mark it made to order",
    );
    expect(describeShelfStateHint(false, true, false, null)).toBe(
      "Shown in the archive",
    );
  });

  it("says a retired piece is still marked for the home page", () => {
    expect(describeShelfStateHint(false, true, true, null)).toBe(
      "Still marked to go first on the home page",
    );
    expect(describeShelfStateHint(false, false, true, null)).toBe(
      "Still marked to go first on the home page",
    );
  });

  it("mentions the home page only for a featured live piece", () => {
    expect(describeShelfStateHint(true, true, true, null)).toBe(
      "Goes first among the pieces on the home page",
    );
    expect(describeShelfStateHint(true, true, false, null)).toBeNull();
  });

  it("says when a marked piece is left off the home page", () => {
    expect(describeShelfStateHint(true, true, true, "sold-out")).toBe(
      "Marked to go first, but left off the home page while sold out",
    );
    expect(describeShelfStateHint(true, true, true, "made-to-order")).toBe(
      "Marked to go first, but left off the home page while made to order",
    );
  });
});

describe("kiln", () => {
  it("names a first and a second", () => {
    expect(describeKiln(false)).toBe("First");
    expect(describeKiln(true)).toBe("Second");
    expect(describeKilnHint(true)).toBe("Sold with its flaw named");
    expect(describeKilnHint(false)).toBe("Sold as a first");
  });
});

describe("stock changes", () => {
  it("turns a direction and a count into a signed move", () => {
    expect(toStockDelta("add", 3)).toBe(3);
    expect(toStockDelta("remove", 2)).toBe(-2);
  });

  it("previews the new count", () => {
    expect(describeStockAfter(3, "add", 2)).toBe("Stock goes from 3 to 5.");
    expect(describeStockAfter(3, "remove", 3)).toBe("Stock goes from 3 to 0.");
  });

  it("shows the current count while the box is empty or too high", () => {
    expect(describeStockAfter(4, "add", Number.NaN)).toBe(
      "4 pieces in stock now.",
    );
    expect(describeStockAfter(1, "remove", 2)).toBe("1 piece in stock now.");
  });
});

describe("folded filters", () => {
  it("counts the filters behind the phone toggle, not the search", () => {
    expect(countFoldedFilters({ search: "mug" })).toBe(0);
    expect(
      countFoldedFilters({ glaze_id: "3", low_stock: "1", page: "2" }),
    ).toBe(2);
  });

  it("labels the toggle with how many are on", () => {
    expect(describeFiltersToggle(false, 0)).toBe("Filters");
    expect(describeFiltersToggle(false, 2)).toBe("Filters · 2 on");
    expect(describeFiltersToggle(true, 2)).toBe("Hide filters");
  });

  it("tells an empty shelf from an over-filtered one", () => {
    expect(describePiecesEmpty({})).toBe(
      "No pieces yet. Add the first with New piece.",
    );
    expect(describePiecesEmpty({ search: "jar" })).toBe(
      "No pieces match those filters. Clear one to see more.",
    );
  });
});

describe("findHomeShelfBlock", () => {
  const ready = { isActive: true, isCustomizable: false, stock: 2 };

  it("lets the home page show only a piece on the shelf, in stock and ready to ship", () => {
    expect(findHomeShelfBlock(ready)).toBeNull();
    expect(findHomeShelfBlock({ ...ready, isActive: false })).toBe("retired");
    expect(findHomeShelfBlock({ ...ready, isCustomizable: true })).toBe(
      "made-to-order",
    );
    // A made-to-order piece has no stock to count, so it reads as made to order, not sold out.
    expect(
      findHomeShelfBlock({ ...ready, isCustomizable: true, stock: 0 }),
    ).toBe("made-to-order");
    expect(findHomeShelfBlock({ ...ready, stock: 0 })).toBe("sold-out");
  });
});

describe("findFeatureBlock", () => {
  const ready = { isActive: true, isCustomizable: false, stock: 2 };

  it("offers the mark only where the home page can show the piece", () => {
    expect(findFeatureBlock(ready, false)).toBeNull();
    expect(findFeatureBlock({ ...ready, isActive: false }, false)).toBe(
      "retired",
    );
    expect(findFeatureBlock({ ...ready, isCustomizable: true }, false)).toBe(
      "made-to-order",
    );
    expect(findFeatureBlock({ ...ready, stock: 0 }, false)).toBe("sold-out");
  });

  it("still lets a marked piece be unmarked, retired, sold out or made to order", () => {
    expect(findFeatureBlock({ ...ready, isActive: false }, true)).toBeNull();
    expect(
      findFeatureBlock({ ...ready, isCustomizable: true }, true),
    ).toBeNull();
    expect(findFeatureBlock({ ...ready, stock: 0 }, true)).toBeNull();
  });
});

describe("describeNewFeatureHint", () => {
  it("says what the box does, or why it cannot be ticked", () => {
    expect(describeNewFeatureHint(null)).toBe(
      "Among the pieces the home page can show, it comes first.",
    );
    expect(describeNewFeatureHint("retired")).toBe(
      "Only a piece on the shelf can be on the home page",
    );
    expect(describeNewFeatureHint("made-to-order")).toBe(
      "The home page shows pieces ready to ship, not made to order",
    );
  });
});

describe("toFormBaseline", () => {
  const submitted = {
    values: { ...EMPTY_PRODUCT_FORM, name: "Moon jar", price: 1800 },
    imageUrls: ["https://cdn.example/a.jpg"],
  };

  it("hands the form back to the server's copy once it was read back", () => {
    expect(toFormBaseline(true, submitted)).toBeNull();
  });

  it("keeps what was sent when the read-back failed", () => {
    expect(toFormBaseline(false, submitted)).toBe(submitted);
  });
});

describe("describeUnsavedChanges", () => {
  it("names photos only when they changed", () => {
    expect(describeUnsavedChanges(false)).toBe(
      "Your changes to this piece are not saved yet.",
    );
    expect(describeUnsavedChanges(true)).toBe(
      "Your changes to this piece, photos included, are not saved yet.",
    );
  });
});
