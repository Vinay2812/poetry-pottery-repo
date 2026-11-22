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

  it("trims a PIN code and checks every digit typed", () => {
    expect(addressSchema.parse(values({ pincode: " 416416 " })).pincode).toBe(
      "416416",
    );
    expect(firstError({ pincode: "4164167" })).toBe("Enter a 6-digit PIN code");
  });

  it("explains what is wrong in words a person can act on", () => {
    expect(firstError({ name: "M" })).toBe(
      "Full name must be at least 2 characters",
    );
    expect(firstError({ phone: "98765" })).toBe(
      "Enter a valid 10-digit phone number",
    );
    expect(firstError({ pincode: "5600011" })).toBe("Enter a 6-digit PIN code");
    expect(firstError({ line1: "12" })).toBe(
      "Flat, house or building must be at least 3 characters",
    );
    expect(firstError({ line2: "x".repeat(121) })).toBe(
      "Area or street must be 120 characters or fewer",
    );
    expect(firstError({ city: "C" })).toBe(
      "City must be at least 2 characters",
    );
    expect(firstError({ state: "K" })).toBe(
      "State must be at least 2 characters",
    );
  });

  it("asks for an empty required field by the name on the form", () => {
    expect(firstError({ name: "" })).toBe("Enter your full name");
    expect(firstError({ phone: "" })).toBe("Enter a phone number");
    expect(firstError({ line1: "  " })).toBe(
      "Enter the flat, house or building",
    );
    expect(firstError({ city: "" })).toBe("Enter the city");
    expect(firstError({ state: "" })).toBe("Enter the state");
  });
});
