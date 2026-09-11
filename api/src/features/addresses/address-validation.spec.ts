import { describe, expect, it } from "vitest";

import { normalisePhone, parseAddressInput } from "./address-validation";
import type { AddressInput } from "./addresses.type";

function input(overrides: Partial<AddressInput> = {}): AddressInput {
  return {
    name: "Maya Iyer",
    phone: "9876543210",
    line1: "12 Kiln Lane",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    ...overrides,
  };
}

describe("normalisePhone", () => {
  it("keeps the ten digits from the ways people type a number", () => {
    expect(normalisePhone("+91 98765-43210")).toBe("9876543210");
    expect(normalisePhone("09876543210")).toBe("9876543210");
    expect(normalisePhone("91 9876543210")).toBe("9876543210");
    expect(normalisePhone("9198765432")).toBe("9198765432");
  });

  it("rejects anything that is not ten digits", () => {
    expect(normalisePhone("98765")).toBeNull();
    expect(normalisePhone("98765432100")).toBeNull();
    expect(normalisePhone("98765abcde")).toBeNull();
  });
});

describe("parseAddressInput", () => {
  it("trims text, normalises the phone and defaults the flag", () => {
    const fields = parseAddressInput(
      input({
        name: "  Maya Iyer  ",
        phone: " +91 98765 43210 ",
        line1: "  12 Kiln Lane  ",
        line2: "   ",
        landmark: " Near the old well ",
      }),
    );

    expect(fields).toEqual({
      name: "Maya Iyer",
      phone: "9876543210",
      line1: "12 Kiln Lane",
      line2: null,
      landmark: "Near the old well",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      is_default: false,
    });
  });

  it("reports the first problem with a human message", () => {
    expect(() => parseAddressInput(input({ name: "M" }))).toThrow(
      "Name must be at least 2 characters",
    );
    expect(() => parseAddressInput(input({ phone: "12345" }))).toThrow(
      "valid 10-digit phone number",
    );
    expect(() => parseAddressInput(input({ pincode: "56001" }))).toThrow(
      "Pincode must be 6 digits",
    );
    expect(() => parseAddressInput(input({ line1: "12" }))).toThrow(
      "Address line 1 must be at least 3 characters",
    );
    expect(() =>
      parseAddressInput(input({ landmark: "x".repeat(121) })),
    ).toThrow("Landmark must be 120 characters or fewer");
    expect(() => parseAddressInput(input({ city: "B" }))).toThrow(
      "City must be at least 2 characters",
    );
  });
});
