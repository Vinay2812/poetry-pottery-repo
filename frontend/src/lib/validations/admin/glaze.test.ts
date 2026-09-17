import { describe, expect, it } from "vitest";

import { adminGlazeSchema } from "./glaze";

function values(overrides: Record<string, unknown> = {}) {
  return {
    name: "Kiln ash",
    description: "A soft grey-green that pools where the wall thickens.",
    variation_note: "",
    color_code: "",
    ...overrides,
  };
}

describe("adminGlazeSchema", () => {
  it("accepts a glaze with just a name and a description", () => {
    expect(adminGlazeSchema.safeParse(values()).success).toBe(true);
  });

  it("wants a name worth reading", () => {
    expect(adminGlazeSchema.safeParse(values({ name: "K" })).success).toBe(
      false,
    );
  });

  it("wants a description", () => {
    expect(
      adminGlazeSchema.safeParse(values({ description: "  " })).success,
    ).toBe(false);
  });

  it("takes a six-digit hex or nothing at all", () => {
    expect(
      adminGlazeSchema.safeParse(values({ color_code: "#6F7D6B" })).success,
    ).toBe(true);
    expect(adminGlazeSchema.safeParse(values({ color_code: "" })).success).toBe(
      true,
    );
    expect(
      adminGlazeSchema.safeParse(values({ color_code: "sage" })).success,
    ).toBe(false);
    expect(
      adminGlazeSchema.safeParse(values({ color_code: "#fff" })).success,
    ).toBe(false);
  });
});
