import { describe, expect, it } from "vitest";

import { OptionGroupKind, ProductSort } from "@/graphql/generated/graphql";

import {
  applyFilterAction,
  computeUnitPrice,
  isPhotoUploadPending,
  MAX_REFERENCE_PHOTO_BYTES,
  type ReferencePhoto,
  remainingReferenceSlots,
  toConfirmedPhotoUrls,
  validateReferencePhoto,
  countActiveFilters,
  toCardPhotoLoading,
  EMPTY_FILTERS,
  parseFilters,
  toArchiveAskUrl,
  toArchiveLabel,
  toArchiveNote,
  toDiscountPercent,
  toFilterInput,
  toSearchParams,
  toBatchLabel,
  toGlazeAskUrl,
  toPhotoAlt,
  toPhotoLabel,
  toShortDescription,
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
        collection: "spring-2025",
        minPrice: 100,
        inStockOnly: true,
        sort: ProductSort.Newest,
        search: "x",
      }),
    ).toBe(4);
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
  it("labels stock levels as batch state", () => {
    expect(toStockStatus(0, false)).toEqual({
      tone: "sold_out",
      label: "Sold out \u00b7 next batch soon",
    });
    expect(toStockStatus(3, false)).toEqual({
      tone: "low",
      label: "Only 3",
    });
    expect(toStockStatus(20, false)).toEqual({
      tone: "in_stock",
      label: "Ready to ship",
    });
    expect(toStockStatus(0, true).tone).toBe("made_to_order");
  });
});

describe("toBatchLabel", () => {
  it("counts the batch", () => {
    expect(toBatchLabel(3, false)).toBe("3 made in this batch");
    expect(toBatchLabel(1, false)).toBe("One made in this batch");
    expect(toBatchLabel(0, false)).toBe("Sold out \u00b7 next batch soon");
    expect(toBatchLabel(0, true)).toBe(
      "Made to order, thrown in about ten days",
    );
  });
});

describe("toShortDescription", () => {
  it("keeps up to three sentences", () => {
    expect(toShortDescription("One. Two. Three.")).toEqual({
      short: "One. Two. Three.",
      hasMore: false,
    });
    const long = toShortDescription("One. Two. Three. Four.");
    expect(long.short).toBe("One. Two. Three.");
    expect(long.hasMore).toBe(true);
  });
});

describe("toGlazeAskUrl", () => {
  it("prefills the product name and skips empty numbers", () => {
    expect(toGlazeAskUrl("+91 91234 56789", "Slate morning mug")).toContain(
      "Slate%20morning%20mug",
    );
    expect(toGlazeAskUrl("", "Slate morning mug")).toBeNull();
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

describe("archive view", () => {
  it("round-trips the archive view through the URL", () => {
    const filters = parseFilters(
      new URLSearchParams("view=archive&category=mugs"),
    );
    expect(filters.isArchive).toBe(true);
    expect(toSearchParams(filters).toString()).toBe(
      "category=mugs&view=archive",
    );
    expect(toFilterInput(filters, 1).archive).toBe(true);
  });

  it("stays on the shelf without the view parameter", () => {
    const filters = parseFilters(new URLSearchParams(""));
    expect(filters.isArchive).toBe(false);
    expect(toSearchParams(filters).has("view")).toBe(false);
    expect(toFilterInput(filters, 1).archive).toBe(false);
  });

  it("says where a piece went instead of counting stock", () => {
    expect(toArchiveLabel(0)).toBe("Found a home");
    expect(toArchiveLabel(2)).toBe("Retired from the shelf");
    expect(toArchiveNote(0)).toBe("This piece has found a home.");
    expect(toArchiveNote(2)).toBe("This piece is no longer on the shelf.");
  });

  it("prefills the ask with the piece name and its page", () => {
    const url = toArchiveAskUrl(
      "+91 98765 43210",
      "Drip sip mug",
      "https://studio.test/products/drip-sip-mug",
    );
    expect(url).toContain("https://wa.me/919876543210?text=");
    expect(decodeURIComponent(url ?? "")).toContain("Drip sip mug");
    expect(decodeURIComponent(url ?? "")).toContain(
      "https://studio.test/products/drip-sip-mug",
    );
    expect(toArchiveAskUrl("", "Drip sip mug", "/x")).toBeNull();
  });

  it("counts photos from one for screen readers", () => {
    expect(toPhotoLabel(0, 4)).toBe("Photo 1 of 4");
    expect(toPhotoLabel(3, 4)).toBe("Photo 4 of 4");
  });

  it("names the first photo after the piece and the rest as views", () => {
    expect(toPhotoAlt("Drip sip mug", 0)).toBe("Drip sip mug");
    expect(toPhotoAlt("Drip sip mug", 2)).toBe("Drip sip mug, view 3");
  });
});

describe("applyFilterAction", () => {
  const base = { ...EMPTY_FILTERS, categories: ["mugs"] };

  it("toggles list filters on and off", () => {
    expect(
      applyFilterAction(base, { type: "category", slug: "bowls" }).categories,
    ).toEqual(["mugs", "bowls"]);
    expect(
      applyFilterAction(base, { type: "category", slug: "mugs" }).categories,
    ).toEqual([]);
    expect(
      applyFilterAction(base, { type: "material", material: "Stoneware" })
        .materials,
    ).toEqual(["Stoneware"]);
  });

  it("keeps one collection at a time and clears it when re-picked", () => {
    const picked = applyFilterAction(base, {
      type: "collection",
      slug: "spring-2025",
    });
    expect(picked.collection).toBe("spring-2025");
    expect(
      applyFilterAction(picked, { type: "collection", slug: "spring-2025" })
        .collection,
    ).toBeNull();
    expect(
      applyFilterAction(picked, { type: "collection", slug: "rustic-charm" })
        .collection,
    ).toBe("rustic-charm");
  });

  it("merges patches in order so rapid clicks add up", () => {
    const merged = [
      { type: "category", slug: "bowls" },
      { type: "inStock", value: true },
      { type: "view", isArchive: true },
      { type: "sort", sort: ProductSort.Newest },
    ].reduce<typeof base>(
      (filters, action) =>
        applyFilterAction(
          filters,
          action as Parameters<typeof applyFilterAction>[1],
        ),
      base,
    );
    expect(merged.categories).toEqual(["mugs", "bowls"]);
    expect(merged.inStockOnly).toBe(true);
    expect(merged.isArchive).toBe(true);
    expect(merged.sort).toBe(ProductSort.Newest);
  });

  it("clears everything but keeps the view", () => {
    const cleared = applyFilterAction(
      { ...base, isArchive: true, minPrice: 100, collection: "x" },
      { type: "clear" },
    );
    expect(cleared).toEqual({ ...EMPTY_FILTERS, isArchive: true });
  });
});

describe("toCardPhotoLoading", () => {
  it("prioritises the phone's first row and only un-lazies the rest of the desktop row", () => {
    expect(toCardPhotoLoading(0)).toEqual({ isPriority: true, isEager: true });
    expect(toCardPhotoLoading(1)).toEqual({ isPriority: true, isEager: true });
    expect(toCardPhotoLoading(2)).toEqual({ isPriority: false, isEager: true });
    expect(toCardPhotoLoading(3)).toEqual({ isPriority: false, isEager: true });
  });

  it("leaves everything below the first row lazy", () => {
    expect(toCardPhotoLoading(4)).toEqual({
      isPriority: false,
      isEager: false,
    });
  });
});

function photo(overrides: Partial<ReferencePhoto>): ReferencePhoto {
  return {
    id: "1",
    name: "shelf.jpg",
    previewUrl: "blob:shelf",
    progress: 100,
    url: null,
    error: null,
    ...overrides,
  };
}

describe("validateReferencePhoto", () => {
  it("accepts a small JPEG, PNG or WebP", () => {
    expect(validateReferencePhoto({ type: "image/jpeg", size: 1024 })).toBe(
      null,
    );
    expect(validateReferencePhoto({ type: "image/png", size: 1024 })).toBe(
      null,
    );
    expect(validateReferencePhoto({ type: "image/webp", size: 1024 })).toBe(
      null,
    );
  });

  it("turns away other types, empty files and anything over 8 MB", () => {
    expect(validateReferencePhoto({ type: "image/gif", size: 1024 })).toBe(
      "Use a JPEG, PNG or WebP photo",
    );
    expect(validateReferencePhoto({ type: "image/jpeg", size: 0 })).toBe(
      "Photos must be under 8 MB",
    );
    expect(
      validateReferencePhoto({
        type: "image/jpeg",
        size: MAX_REFERENCE_PHOTO_BYTES + 1,
      }),
    ).toBe("Photos must be under 8 MB");
    expect(
      validateReferencePhoto({
        type: "image/jpeg",
        size: MAX_REFERENCE_PHOTO_BYTES,
      }),
    ).toBe(null);
  });
});

describe("remainingReferenceSlots", () => {
  it("counts down to three and never below zero", () => {
    expect(remainingReferenceSlots(0)).toBe(3);
    expect(remainingReferenceSlots(2)).toBe(1);
    expect(remainingReferenceSlots(3)).toBe(0);
    expect(remainingReferenceSlots(5)).toBe(0);
  });
});

describe("toConfirmedPhotoUrls", () => {
  it("keeps only the photos the server confirmed", () => {
    expect(
      toConfirmedPhotoUrls([
        photo({ id: "1", url: "https://cdn.test/a.jpg" }),
        photo({ id: "2", url: null }),
        photo({ id: "3", url: null, error: "Upload failed" }),
      ]),
    ).toEqual(["https://cdn.test/a.jpg"]);
    expect(toConfirmedPhotoUrls([])).toEqual([]);
  });
});

describe("isPhotoUploadPending", () => {
  it("waits on photos still in flight but not on failed ones", () => {
    expect(isPhotoUploadPending([])).toBe(false);
    expect(
      isPhotoUploadPending([photo({ url: "https://cdn.test/a.jpg" })]),
    ).toBe(false);
    expect(isPhotoUploadPending([photo({ url: null })])).toBe(true);
    expect(
      isPhotoUploadPending([photo({ url: null, error: "Upload failed" })]),
    ).toBe(false);
  });
});
