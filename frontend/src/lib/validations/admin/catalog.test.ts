import { describe, expect, it } from "vitest";

import { adminCategorySchema, adminCollectionSchema } from "./catalog";

function categoryValues(overrides: Record<string, unknown> = {}) {
  return { name: "Mugs", icon: "mug", sort_order: "3", ...overrides };
}

function collectionValues(overrides: Record<string, unknown> = {}) {
  return {
    name: "Monsoon shelf",
    description: "Pieces glazed during the rains.",
    starts_at: "2026-06-01T09:00",
    ends_at: "2026-08-31T18:00",
    ...overrides,
  };
}

function firstCategoryError(overrides: Record<string, unknown>): string {
  const result = adminCategorySchema.safeParse(categoryValues(overrides));
  return result.success ? "" : (result.error.issues[0]?.message ?? "");
}

function firstCollectionError(overrides: Record<string, unknown>): string {
  const result = adminCollectionSchema.safeParse(collectionValues(overrides));
  return result.success ? "" : (result.error.issues[0]?.message ?? "");
}

describe("adminCategorySchema", () => {
  it("trims the text it keeps", () => {
    expect(
      adminCategorySchema.parse(categoryValues({ name: "  Mugs " })),
    ).toEqual({ name: "Mugs", icon: "mug", sort_order: "3" });
  });

  it("wants a name worth reading", () => {
    expect(firstCategoryError({ name: "M" })).toBe(
      "Name must be at least 2 characters",
    );
    expect(firstCategoryError({ name: "x".repeat(61) })).toBe(
      "Name must be 60 characters or fewer",
    );
  });

  it("takes an empty icon", () => {
    expect(
      adminCategorySchema.safeParse(categoryValues({ icon: "" })).success,
    ).toBe(true);
  });

  it("only counts whole numbers as a sort order", () => {
    expect(firstCategoryError({ sort_order: "-1" })).toBe(
      "Sort order must be a whole number",
    );
    expect(firstCategoryError({ sort_order: "1.5" })).toBe(
      "Sort order must be a whole number",
    );
    expect(firstCategoryError({ sort_order: "" })).toBe(
      "Sort order must be a whole number",
    );
    expect(
      adminCategorySchema.safeParse(categoryValues({ sort_order: "0" }))
        .success,
    ).toBe(true);
  });
});

describe("adminCollectionSchema", () => {
  it("accepts a window with both ends open", () => {
    const result = adminCollectionSchema.safeParse(
      collectionValues({ starts_at: "", ends_at: "" }),
    );
    expect(result.success).toBe(true);
  });

  it("accepts a window with one end open", () => {
    expect(
      adminCollectionSchema.safeParse(collectionValues({ ends_at: "" }))
        .success,
    ).toBe(true);
    expect(
      adminCollectionSchema.safeParse(collectionValues({ starts_at: "" }))
        .success,
    ).toBe(true);
  });

  it("rejects an end that lands before the start", () => {
    expect(firstCollectionError({ ends_at: "2026-05-01T09:00" })).toBe(
      "The end has to come after the start",
    );
  });

  it("rejects an end that lands exactly on the start", () => {
    expect(firstCollectionError({ ends_at: "2026-06-01T09:00" })).toBe(
      "The end has to come after the start",
    );
  });

  it("reports the end date field so the error sits under it", () => {
    const result = adminCollectionSchema.safeParse(
      collectionValues({ ends_at: "2026-05-01T09:00" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["ends_at"]);
    }
  });
});
