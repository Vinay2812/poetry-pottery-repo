import { describe, expect, it } from "vitest";

import { OptionGroupKind, ProductSort } from "@/graphql/generated/graphql";
import { toUrlSearchParams } from "@/lib/search-params";

import { FOOTER_SHOP_LINKS } from "@/features/layout/types";

import {
  applyFilterAction,
  clampPriceRange,
  computeUnitPrice,
  FAILED_PHOTO_MESSAGE,
  hasFailedPhoto,
  isPhotoUploadPending,
  MAX_REFERENCE_PHOTO_BYTES,
  type ReferencePhoto,
  remainingReferenceSlots,
  SORT_OPTIONS,
  toProductSort,
  toConfirmedPhotoUrls,
  toDefaultSelections,
  validateReferencePhoto,
  countActiveFilters,
  toBelowFoldCardPhotoLoading,
  toCardPhotoLoading,
  EMPTY_FILTERS,
  parseFilters,
  toArchiveAskUrl,
  toArchiveCommissionPath,
  toArchiveLabel,
  toArchiveNote,
  toFilterInput,
  toFilterKey,
  toResultCountLabel,
  isShelfCountable,
  toShelfCountLine,
  toShelfPhase,
  toShelfResult,
  toShelfTabCount,
  toShowPiecesLabel,
  toSearchParams,
  isStickyBarWanted,
  isTuckedUnderHeader,
  toAddToCartLabel,
  toBatchLabel,
  toQuantityTotalLine,
  toCardStatusLine,
  toFlawNote,
  toGlazeAskUrl,
  toPhotoAlt,
  toPhotoHoldMessage,
  toPhotoLabel,
  formatCapacity,
  formatCentimetres,
  formatWeight,
  type PieceFacts,
  toFactRows,
  toGlazePath,
  toPieceScale,
  toPriceRangeLabel,
  toProductPath,
  toShortDescription,
  toSizeLine,
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

  it("serialises the two filters an empty shelf URL keeps quiet", () => {
    expect(
      toSearchParams({
        ...EMPTY_FILTERS,
        collection: "spring-2025",
        customizableOnly: true,
      }).toString(),
    ).toBe("collection=spring-2025&customizable=true");
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
    expect(
      countActiveFilters({ ...EMPTY_FILTERS, customizableOnly: true }),
    ).toBe(1);
    expect(countActiveFilters({ ...EMPTY_FILTERS, secondsOnly: true })).toBe(1);
  });

  it("round-trips the seconds toggle through the URL", () => {
    const filters = parseFilters(new URLSearchParams("seconds=1&view=archive"));
    expect(filters.secondsOnly).toBe(true);
    expect(filters.isArchive).toBe(true);
    expect(toSearchParams(filters).toString()).toBe("seconds=1&view=archive");
    expect(toFilterInput(filters, 1).seconds_only).toBe(true);
    expect(toSearchParams(EMPTY_FILTERS).has("seconds")).toBe(false);
  });
});

describe("toFilterInput", () => {
  it("sends the untouched filters as null so the API ignores them", () => {
    expect(toFilterInput(EMPTY_FILTERS, 1)).toEqual({
      search: null,
      category_slugs: null,
      glaze_slugs: null,
      materials: null,
      collection_slug: null,
      min_price: null,
      max_price: null,
      in_stock_only: null,
      customizable_only: null,
      seconds_only: null,
      archive: false,
      sort: ProductSort.Featured,
      page: 1,
      limit: 24,
    });
  });

  it("passes the picked lists and the rupee range straight through", () => {
    const input = toFilterInput(
      {
        ...EMPTY_FILTERS,
        search: "mug",
        materials: ["Stoneware", "Porcelain"],
        minPrice: 0,
        maxPrice: 250_000,
        inStockOnly: true,
        customizableOnly: true,
      },
      3,
    );
    expect(input.materials).toEqual(["Stoneware", "Porcelain"]);
    expect(input.min_price).toBe(0);
    expect(input.max_price).toBe(250_000);
    expect(input.in_stock_only).toBe(true);
    expect(input.customizable_only).toBe(true);
    expect(input.page).toBe(3);
  });
});

describe("toShelfResult", () => {
  const none = {
    current: undefined,
    serverPage: undefined,
    previous: undefined,
    initial: undefined,
    isLoading: false,
  };

  it("prefers the browser's answer, then the server's page, then the last answer", () => {
    expect(
      toShelfResult({ ...none, current: "own", serverPage: "server" }),
    ).toBe("own");
    expect(
      toShelfResult({ ...none, serverPage: "server", previous: "last" }),
    ).toBe("server");
    expect(toShelfResult({ ...none, previous: "last", initial: "first" })).toBe(
      "last",
    );
  });

  it("falls back to the rendered page only while the browser's first answer is out", () => {
    expect(toShelfResult({ ...none, initial: "first", isLoading: true })).toBe(
      "first",
    );
    expect(toShelfResult({ ...none, initial: "first" })).toBeUndefined();
  });
});

describe("shelf phase copy", () => {
  it("counts only a settled list", () => {
    expect(isShelfCountable("ready")).toBe(true);
    expect(isShelfCountable("pending")).toBe(false);
    expect(toShelfTabCount("ready", 7)).toBe(7);
    expect(toShelfTabCount("pending", 7)).toBeNull();
    expect(toShelfTabCount("failed", 7)).toBeNull();
  });

  it("says finding, the count or nothing in the toolbar", () => {
    expect(toShelfCountLine("pending", "7 pieces")).toBe(
      "Finding pieces\u2026",
    );
    expect(toShelfCountLine("ready", "7 pieces")).toBe("7 pieces");
    expect(toShelfCountLine("failed", "7 pieces")).toBeNull();
  });

  it("always gives the sheet a way to close", () => {
    expect(toShowPiecesLabel("ready", 1)).toBe("Show 1 piece");
    expect(toShowPiecesLabel("ready", 7)).toBe("Show 7 pieces");
    expect(toShowPiecesLabel("pending", 7)).toBe("Finding pieces\u2026");
    expect(toShowPiecesLabel("failed", 7)).toBe("Show pieces");
  });
});

describe("toShelfPhase", () => {
  const settled = {
    hasFailed: false,
    isFiltersMoving: false,
    hasOwnPage: true,
    isOwnPageLoading: false,
    hasServerPage: false,
  };

  it("is ready with the browser's own page or a matching server page", () => {
    expect(toShelfPhase(settled)).toBe("ready");
    expect(
      toShelfPhase({ ...settled, hasOwnPage: false, hasServerPage: true }),
    ).toBe("ready");
  });

  it("is pending while the first page loads or the filters are ahead of it", () => {
    expect(toShelfPhase({ ...settled, isOwnPageLoading: true })).toBe(
      "pending",
    );
    expect(toShelfPhase({ ...settled, isFiltersMoving: true })).toBe("pending");
    expect(toShelfPhase({ ...settled, hasOwnPage: false })).toBe("pending");
  });

  it("lets a failure win over everything else", () => {
    expect(
      toShelfPhase({ ...settled, hasFailed: true, isFiltersMoving: true }),
    ).toBe("failed");
  });
});

describe("toPriceRangeLabel", () => {
  it("names the chosen price in words", () => {
    expect(toPriceRangeLabel(500, 2000)).toBe("\u20b9500 to \u20b92,000");
    expect(toPriceRangeLabel(500, null)).toBe("From \u20b9500");
    expect(toPriceRangeLabel(null, 2000)).toBe("Up to \u20b92,000");
    expect(toPriceRangeLabel(null, null)).toBeNull();
  });
});

describe("toFilterInput while searching", () => {
  it("leaves the sort out, since a search keeps its relevance order", () => {
    const filters = { ...EMPTY_FILTERS, sort: ProductSort.PriceLowToHigh };

    expect(toFilterInput(filters, 1).sort).toBe(ProductSort.PriceLowToHigh);
    expect(toFilterInput({ ...filters, search: "mug" }, 1).sort).toBeNull();
    expect(toFilterKey(toFilterInput({ ...filters, search: "mug" }, 1))).toBe(
      toFilterKey(toFilterInput({ ...EMPTY_FILTERS, search: "mug" }, 1)),
    );
  });
});

describe("toResultCountLabel", () => {
  it("counts pieces", () => {
    expect(toResultCountLabel(1, "", false)).toBe("1 piece");
    expect(toResultCountLabel(7, "", false)).toBe("7 pieces");
  });

  it("names the made-to-order shelf and the search term", () => {
    expect(toResultCountLabel(3, "", true)).toBe("3 made-to-order pieces");
    expect(toResultCountLabel(4, "mug", false)).toBe(
      "4 pieces for \u201cmug\u201d",
    );
    expect(toResultCountLabel(1, "bowl", true)).toBe(
      "1 made-to-order piece for \u201cbowl\u201d",
    );
  });
});

describe("toProductSort", () => {
  it("accepts only the sorts the shelf offers", () => {
    expect(toProductSort("NEWEST")).toBe(ProductSort.Newest);
    expect(toProductSort("newest")).toBeNull();
    expect(toProductSort("RELEVANCE")).toBeNull();
    expect(toProductSort(null)).toBeNull();
  });
});

describe("SORT_OPTIONS", () => {
  it("shares its names with the footer links that open a sort", () => {
    for (const link of FOOTER_SHOP_LINKS) {
      const sort = new URLSearchParams(link.href.split("?")[1] ?? "").get(
        "sort",
      );
      if (!sort) continue;
      const option = SORT_OPTIONS.find((candidate) => candidate.value === sort);
      expect(option?.label).toBe(link.label);
    }
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
      label: "3 left in this batch",
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
    expect(toBatchLabel(3, false)).toBe("3 left in this batch");
    expect(toBatchLabel(1, false)).toBe("1 left in this batch");
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

  it("has nothing to trim when the piece has no description", () => {
    expect(toShortDescription("")).toEqual({ short: "", hasMore: false });
  });
});

describe("toGlazeAskUrl", () => {
  it("prefills the product name and skips empty numbers", () => {
    expect(toGlazeAskUrl("+91 91234 56789", "Slate morning mug")).toContain(
      "Slate%20morning%20mug",
    );
    expect(toGlazeAskUrl("", "Slate morning mug")).toBeNull();
  });

  it("puts 91 in front of a legacy 10-digit number, as every studio link does", () => {
    expect(toGlazeAskUrl("91234 56789", "Mug")).toMatch(
      /^https:\/\/wa\.me\/919123456789\?text=/,
    );
    expect(
      toArchiveAskUrl("91234 56789", "Mug", "https://example.com/p/mug"),
    ).toMatch(/^https:\/\/wa\.me\/919123456789\?text=/);
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

  it("ignores a pick that no longer fits its group", () => {
    expect(computeUnitPrice(950, groups, { 1: { optionId: 99 } })).toBe(950);
    expect(computeUnitPrice(950, groups, { 1: { text: "Maya" } })).toBe(950);
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

  it("links a piece by its slug", () => {
    expect(toProductPath("drip-sip-mug")).toBe("/products/drip-sip-mug");
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

  it("trims a typed search and carries the rupee range", () => {
    expect(
      applyFilterAction(base, { type: "search", value: "  speckled mug " })
        .search,
    ).toBe("speckled mug");
    const priced = applyFilterAction(base, {
      type: "price",
      min: 0,
      max: 4000,
    });
    expect(priced.minPrice).toBe(0);
    expect(priced.maxPrice).toBe(4000);
    expect(
      applyFilterAction(priced, { type: "price", min: null, max: null })
        .maxPrice,
    ).toBeNull();
    expect(
      applyFilterAction(base, { type: "customizable", value: true })
        .customizableOnly,
    ).toBe(true);
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

describe("toBelowFoldCardPhotoLoading", () => {
  it("un-lazies only a phone's first row and never asks for priority", () => {
    expect(toBelowFoldCardPhotoLoading(0)).toEqual({
      isPriority: false,
      isEager: true,
    });
    expect(toBelowFoldCardPhotoLoading(1)).toEqual({
      isPriority: false,
      isEager: true,
    });
    expect(toBelowFoldCardPhotoLoading(2)).toEqual({
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

describe("hasFailedPhoto", () => {
  it("flags a photo the bucket refused, not one still in flight", () => {
    expect(hasFailedPhoto([])).toBe(false);
    expect(hasFailedPhoto([photo({ url: null })])).toBe(false);
    expect(hasFailedPhoto([photo({ url: null, error: "Upload failed" })])).toBe(
      true,
    );
  });
});

describe("toPhotoHoldMessage", () => {
  it("lets the photos go when there are none or all are uploaded", () => {
    expect(toPhotoHoldMessage([])).toBeNull();
    expect(
      toPhotoHoldMessage([photo({ url: "https://cdn.test/a.jpg" })]),
    ).toBeNull();
  });

  it("waits for a photo still uploading", () => {
    expect(toPhotoHoldMessage([photo({ url: null })])).toBe(
      "Wait for the photos to finish uploading",
    );
  });

  it("asks for a failed photo to be added again", () => {
    expect(
      toPhotoHoldMessage([photo({ url: null, error: "Upload failed" })]),
    ).toBe(FAILED_PHOTO_MESSAGE);
  });

  // A held send shows this live, so it must move on as the same photo settles.
  it("follows one photo from uploading to failed, and clears once it is uploaded", () => {
    const uploading = photo({ url: null });
    const failed = photo({ url: null, error: "Upload failed" });
    const uploaded = photo({ url: "https://cdn.test/a.jpg" });
    expect(
      [uploading, failed, uploaded].map((p) => toPhotoHoldMessage([p])),
    ).toEqual([
      "Wait for the photos to finish uploading",
      FAILED_PHOTO_MESSAGE,
      null,
    ]);
  });
});

describe("clampPriceRange", () => {
  it("pulls a range from the url inside the bounds the shelf offers", () => {
    expect(clampPriceRange([250, 25000], 400, 15000)).toEqual([400, 15000]);
    expect(clampPriceRange([600, 3800], 400, 15000)).toEqual([600, 3800]);
  });

  it("keeps the handles in order when the bounds collapse", () => {
    expect(clampPriceRange([900, 300], 400, 15000)).toEqual([900, 900]);
    expect(clampPriceRange([200, 800], 600, 600)).toEqual([600, 600]);
  });
});

describe("toDefaultSelections", () => {
  it("opens every required choice on its first option", () => {
    expect(toDefaultSelections(groups)).toEqual({ 1: { optionId: 10 } });
  });

  it("leaves optional groups and empty choices alone", () => {
    expect(
      toDefaultSelections([
        { ...groups[0]!, id: 3, is_required: false },
        { ...groups[0]!, id: 4, options: [] },
      ]),
    ).toEqual({});
  });
});

const FACTS: PieceFacts = {
  material: "Stoneware",
  glazeName: "Ocean Blue",
  dimensions: null,
  heightCm: 9.5,
  diameterCm: 8,
  capacityMl: 250,
  weightG: 320,
  isCustomizable: false,
  isArchived: false,
  sizeChoices: [],
};

describe("piece measurements", () => {
  it("writes a whole number of centimetres without a decimal point", () => {
    expect(formatCentimetres(8)).toBe("8 cm");
    expect(formatCentimetres(9.5)).toBe("9.5 cm");
    expect(formatCentimetres(9.47)).toBe("9.5 cm");
    expect(formatCentimetres(0)).toBeNull();
    expect(formatCentimetres(null)).toBeNull();
  });

  it("only writes a capacity and a weight the studio has taken", () => {
    expect(formatCapacity(250)).toBe("250 ml");
    expect(formatCapacity(0)).toBeNull();
    expect(formatCapacity(null)).toBeNull();
    expect(formatWeight(320)).toBe("320 g");
    expect(formatWeight(null)).toBeNull();
  });

  it("prefers the written size and falls back to the measurements", () => {
    expect(toSizeLine("Holds a full cup", 9.5, 8)).toBe("Holds a full cup");
    expect(toSizeLine(null, 9.5, 8)).toBe("9.5 cm tall, 8 cm across");
    expect(toSizeLine(null, 9.5, null)).toBe("9.5 cm");
    expect(toSizeLine(null, null, 18)).toBe("18 cm across");
    expect(toSizeLine("  ", null, null)).toBeNull();
  });
});

describe("toFactRows", () => {
  it("lists the measurements it has and drops the ones it does not", () => {
    expect(toFactRows(FACTS)).toEqual([
      { label: "Clay body", value: "Stoneware" },
      { label: "Glaze", value: "Ocean Blue" },
      { label: "Size", value: "9.5 cm tall, 8 cm across" },
      { label: "Capacity", value: "250 ml" },
      { label: "Weight", value: "320 g" },
      { label: "Made in", value: "Sangli, Maharashtra" },
      { label: "Ships in", value: "Three working days" },
    ]);
    const bare = toFactRows({
      ...FACTS,
      glazeName: null,
      heightCm: null,
      diameterCm: null,
      capacityMl: null,
      weightG: null,
    });
    expect(bare.map((row) => row.label)).toEqual([
      "Clay body",
      "Made in",
      "Ships in",
    ]);
  });

  it("still names clay body, glaze and size on a made-to-order piece", () => {
    const rows = toFactRows({
      ...FACTS,
      glazeName: null,
      heightCm: null,
      diameterCm: null,
      capacityMl: null,
      weightG: null,
      isCustomizable: true,
      sizeChoices: ["Small", "Large"],
    });
    expect(rows).toContainEqual({ label: "Glaze", value: "Chosen with you" });
    expect(rows).toContainEqual({ label: "Size", value: "Small, Large" });
    expect(rows).toContainEqual({
      label: "Ships in",
      value: "About ten days",
    });
  });

  it("leaves shipping out for an archived piece that is no longer for sale", () => {
    const rows = toFactRows({ ...FACTS, isArchived: true });
    expect(rows.map((row) => row.label)).not.toContain("Ships in");
    expect(rows).toContainEqual({
      label: "Made in",
      value: "Sangli, Maharashtra",
    });
  });
});

describe("toPieceScale", () => {
  it("draws both silhouettes on one floor at true relative scale", () => {
    const scale = toPieceScale(9.5, 8, 9, 8);
    expect(scale.pieceHeight / scale.cupHeight).toBeCloseTo(9.5 / 9);
    expect(scale.pieceWidth / scale.cupWidth).toBeCloseTo(1);
    // Both stand on y = 0 and the box reaches the taller of the two.
    expect(scale.minY).toBeLessThan(-scale.pieceHeight);
    expect(scale.height + scale.minY).toBeGreaterThan(0);
  });

  it("keeps a tall piece and the cup from overlapping", () => {
    const scale = toPieceScale(26, 13, 9, 8);
    expect(scale.pieceX + scale.pieceWidth / 2).toBeLessThan(
      scale.cupX - scale.cupWidth / 2,
    );
    expect(scale.cupX + scale.cupWidth / 2).toBeLessThan(scale.width);
    expect(scale.minY).toBeCloseTo(-(26 * 10 + 8));
  });
});

describe("toGlazePath", () => {
  it("points at the shelf filtered to one glaze", () => {
    expect(toGlazePath("ocean-blue")).toBe("/products?glaze=ocean-blue");
  });
});

describe("toCardStatusLine", () => {
  it("says nothing when a full-price piece is simply in stock", () => {
    expect(toCardStatusLine(false, "in_stock", "Ready to ship")).toBeNull();
  });

  it("names the second on its own and alongside the batch line", () => {
    expect(toCardStatusLine(true, "in_stock", "Ready to ship")).toBe("Second");
    expect(toCardStatusLine(true, "low", "2 left in this batch")).toBe(
      "Second \u00b7 2 left in this batch",
    );
    expect(toCardStatusLine(false, "low", "2 left in this batch")).toBe(
      "2 left in this batch",
    );
  });
});

describe("toFlawNote", () => {
  it("prefers the studio's own note", () => {
    expect(toFlawNote("  The rim dipped in the firing.  ")).toBe(
      "The rim dipped in the firing.",
    );
  });

  it("still admits the piece is a second when no note was written", () => {
    expect(toFlawNote(null)).toContain("lower price");
    expect(toFlawNote("   ")).toBe(toFlawNote(null));
  });
});

describe("toArchiveCommissionPath", () => {
  it("points at the commission form with the piece as the reference", () => {
    expect(toArchiveCommissionPath("drip-sip-mug")).toBe(
      "/custom?like=drip-sip-mug",
    );
  });
});

describe("toFilterKey", () => {
  it("gives the server's page params and the browser's query string the same key", () => {
    const server = toFilterInput(
      parseFilters(
        toUrlSearchParams({ category: ["mugs", "bowls"], sort: "newest" }),
      ),
      1,
    );
    const browser = toFilterInput(
      parseFilters(
        new URLSearchParams("category=mugs&category=bowls&sort=newest"),
      ),
      1,
    );
    expect(toFilterKey(server)).toBe(toFilterKey(browser));
    expect(toFilterKey(server)).not.toBe(
      toFilterKey(toFilterInput(parseFilters(new URLSearchParams()), 1)),
    );
  });
});

describe("toAddToCartLabel", () => {
  it("names the count only once there is more than one", () => {
    expect(toAddToCartLabel(1)).toBe("Add to cart");
    expect(toAddToCartLabel(3)).toBe("Add 3 to cart");
  });
});

describe("toQuantityTotalLine", () => {
  it("says the total only for more than one piece", () => {
    expect(toQuantityTotalLine(1, "\u20b9500")).toBeNull();
    expect(toQuantityTotalLine(2, "\u20b91,000")).toBe(
      "2 pieces, \u20b91,000 together",
    );
  });
});

describe("isTuckedUnderHeader", () => {
  it("counts the buttons gone once their bottom edge passes under the header", () => {
    expect(isTuckedUnderHeader(66, 65)).toBe(false);
    expect(isTuckedUnderHeader(65, 65)).toBe(true);
    expect(isTuckedUnderHeader(-400, 65)).toBe(true);
    // A larger root font makes a taller header, and the edge moves with it.
    expect(isTuckedUnderHeader(70, 81)).toBe(true);
  });

  it("keeps them in play while they are still below the fold", () => {
    expect(isTuckedUnderHeader(1200, 65)).toBe(false);
  });
});

describe("isStickyBarWanted", () => {
  const edges = {
    rowBottom: 40,
    headerBottom: 65,
    footerTop: 2000,
    viewportHeight: 844,
  };

  it("stands in once the buttons are under the header and the footer is still below", () => {
    expect(isStickyBarWanted(edges)).toBe(true);
  });

  it("stays away while the buttons are on screen", () => {
    expect(isStickyBarWanted({ ...edges, rowBottom: 300 })).toBe(false);
  });

  it("steps aside as soon as the footer reaches the screen", () => {
    expect(isStickyBarWanted({ ...edges, footerTop: 843 })).toBe(false);
    expect(isStickyBarWanted({ ...edges, footerTop: 844 })).toBe(true);
  });

  it("behaves as before on a page without a footer", () => {
    expect(isStickyBarWanted({ ...edges, footerTop: Infinity })).toBe(true);
  });
});
