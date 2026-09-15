import { describe, expect, it } from "vitest";

import { addressSchema } from "./address";

function values(overrides: Record<string, unknown> = {}) {
  return {
    name: "Maya Iyer",
    phone: "9876543210",
    line1: "12 Kiln Lane",
    line2: "",
    landmark: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    is_default: false,
    ...overrides,
  };
}

function firstError(overrides: Record<string, unknown>): string {
  const result = addressSchema.safeParse(values(overrides));
  return result.success ? "" : (result.error.issues[0]?.message ?? "");
}

describe("addressSchema", () => {
  it("trims text and keeps the ten digits of the phone", () => {
    const result = addressSchema.parse(
      values({
        name: "  Maya Iyer ",
        phone: " +91 98765-43210 ",
        landmark: " Near the old well ",
      }),
    );

    expect(result.name).toBe("Maya Iyer");
    expect(result.phone).toBe("9876543210");
    expect(result.landmark).toBe("Near the old well");
  });

  it("accepts the 91 and 0 prefixes people type", () => {
    expect(addressSchema.parse(values({ phone: "09876543210" })).phone).toBe(
      "9876543210",
    );
    expect(addressSchema.parse(values({ phone: "91 9876543210" })).phone).toBe(
      "9876543210",
    );
  });

  it("leaves the optional lines empty when they are blank", () => {
    const result = addressSchema.parse(values({ line2: "   " }));
    expect(result.line2).toBe("");
  });

  it("explains what is wrong in words a person can act on", () => {
    expect(firstError({ name: "M" })).toBe(
      "Name must be at least 2 characters",
    );
    expect(firstError({ phone: "98765" })).toBe(
      "Enter a valid 10-digit phone number",
    );
    expect(firstError({ pincode: "5600011" })).toBe("Pincode must be 6 digits");
    expect(firstError({ line1: "12" })).toBe(
      "Address line 1 must be at least 3 characters",
    );
    expect(firstError({ line2: "x".repeat(121) })).toBe(
      "Address line 2 must be 120 characters or fewer",
    );
    expect(firstError({ city: "" })).toBe("City must be at least 2 characters");
    expect(firstError({ state: "K" })).toBe(
      "State must be at least 2 characters",
    );
  });
});
