import { describe, expect, it } from "vitest";

import { OptionGroupKind } from "@/graphql/generated/graphql";

import {
  optionGroupSchema,
  productOptionSchema,
  productSchema,
  stockAdjustSchema,
  type ProductFormValues,
} from "./product";

const VALID: ProductFormValues = {
  name: "Slate morning mug",
  description: "Thrown on the wheel and fired once.",
  price: 1200,
  compare_at_price: null,
  material: "Stoneware",
  dimensions: "9 cm × 8 cm",
  color_name: "Slate",
  color_code: "#4F6F52",
  stock: 6,
  care_notes: "Hand wash\nNo microwave",
  capacity_ml: 300,
  height_cm: 9.5,
  diameter_cm: 8,
  weight_g: 420,
  maker_note: "Thrown on a wet Tuesday.",
  category_ids: [1, 2],
  collection_id: 3,
  glaze_id: 4,
  is_customizable: false,
  is_second: false,
  flaw_note: "",
  is_commission: false,
  is_featured: false,
  is_active: true,
};

function messageFor(values: ProductFormValues, path: string): string | null {
  const result = productSchema.safeParse(values);
  if (result.success) return null;
  const issue = result.error.issues.find((item) => item.path[0] === path);
  return issue?.message ?? null;
}

describe("productSchema", () => {
  it("accepts a filled-in piece", () => {
    expect(productSchema.safeParse(VALID).success).toBe(true);
  });

  it("rejects a negative price", () => {
    expect(messageFor({ ...VALID, price: -1 }, "price")).toBe(
      "Price cannot be negative",
    );
  });

  it("rejects a price with paise in it", () => {
    expect(messageFor({ ...VALID, price: 1200.5 }, "price")).toBe(
      "Price must be a whole number of rupees",
    );
  });

  it("rejects an empty name", () => {
    expect(messageFor({ ...VALID, name: "" }, "name")).toBe(
      "Name must be at least 2 characters",
    );
  });

  it("rejects a compare at price below the price", () => {
    expect(
      messageFor(
        { ...VALID, price: 1200, compare_at_price: 900 },
        "compare_at_price",
      ),
    ).toBe("Compare at price must be at least the price");
  });

  it("accepts a compare at price equal to the price", () => {
    const values = { ...VALID, price: 1200, compare_at_price: 1200 };
    expect(productSchema.safeParse(values).success).toBe(true);
  });

  it("accepts an empty glaze colour but not a broken one", () => {
    expect(productSchema.safeParse({ ...VALID, color_code: "" }).success).toBe(
      true,
    );
    expect(messageFor({ ...VALID, color_code: "sage" }, "color_code")).toBe(
      "Use a hex colour like #C4785A",
    );
  });

  it("rejects a missing description", () => {
    expect(messageFor({ ...VALID, description: "   " }, "description")).toBe(
      "Description is required",
    );
  });
});

describe("optionGroupSchema", () => {
  const group = {
    name: "Handle",
    kind: OptionGroupKind.Choice,
    is_required: true,
    sort_order: 0,
    price_modifier: 0,
    max_length: null,
  };

  it("accepts a choice group with no length limit", () => {
    expect(optionGroupSchema.safeParse(group).success).toBe(true);
  });

  it("takes a length for a text group", () => {
    const parsed = optionGroupSchema.safeParse({
      ...group,
      kind: OptionGroupKind.Text,
      max_length: 24,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a length below one", () => {
    const parsed = optionGroupSchema.safeParse({ ...group, max_length: 0 });
    expect(parsed.success).toBe(false);
  });

  it("rejects a negative sort order", () => {
    const parsed = optionGroupSchema.safeParse({ ...group, sort_order: -1 });
    expect(parsed.success).toBe(false);
  });
});

describe("productOptionSchema", () => {
  const option = {
    name: "No handle",
    price_modifier: -100,
    sort_order: 1,
    is_active: true,
  };

  it("allows a negative price change", () => {
    expect(productOptionSchema.safeParse(option).success).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(productOptionSchema.safeParse({ ...option, name: "" }).success).toBe(
      false,
    );
  });
});

describe("stockAdjustSchema", () => {
  it("takes a positive or negative move", () => {
    expect(
      stockAdjustSchema.safeParse({ delta: 4, reason: "New batch" }).success,
    ).toBe(true);
    expect(
      stockAdjustSchema.safeParse({ delta: -2, reason: "Broken in the kiln" })
        .success,
    ).toBe(true);
  });

  it("rejects a move of zero", () => {
    const parsed = stockAdjustSchema.safeParse({ delta: 0, reason: "Nothing" });
    expect(parsed.success).toBe(false);
  });

  it("needs a reason", () => {
    const parsed = stockAdjustSchema.safeParse({ delta: 2, reason: "" });
    expect(parsed.success).toBe(false);
  });
});

describe("productSchema measurements", () => {
  it("takes an unmeasured piece as it is", () => {
    expect(
      productSchema.safeParse({
        ...VALID,
        capacity_ml: null,
        height_cm: null,
        diameter_cm: null,
        weight_g: null,
      }).success,
    ).toBe(true);
  });

  it("refuses a measurement of zero", () => {
    expect(messageFor({ ...VALID, height_cm: 0 }, "height_cm")).toBe(
      "Height must be more than zero",
    );
  });

  it("refuses a capacity no pot could hold", () => {
    expect(messageFor({ ...VALID, capacity_ml: 99999 }, "capacity_ml")).toBe(
      "Capacity must be 20000 or less",
    );
  });
});

describe("productSchema seconds", () => {
  it("wants the flaw named before a piece is sold as a second", () => {
    expect(
      messageFor({ ...VALID, is_second: true, flaw_note: "" }, "flaw_note"),
    ).toBe("Say what the kiln left on this piece");
  });

  it("is happy once the flaw is named", () => {
    expect(
      productSchema.safeParse({
        ...VALID,
        is_second: true,
        flaw_note: "Glaze crawl on the foot ring.",
      }).success,
    ).toBe(true);
  });
});
