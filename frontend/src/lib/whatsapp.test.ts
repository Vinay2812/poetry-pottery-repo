import { describe, expect, it } from "vitest";

import { toStoredWhatsAppNumber, toWhatsAppDigits } from "./whatsapp";

describe("toWhatsAppDigits", () => {
  it("puts 91 in front of a bare 10-digit number", () => {
    expect(toWhatsAppDigits("98765 43210")).toBe("919876543210");
  });

  it("swaps a leading 0 for 91", () => {
    expect(toWhatsAppDigits("098765-43210")).toBe("919876543210");
  });

  it("keeps a number that already has the country code", () => {
    expect(toWhatsAppDigits("+91 98765 43210")).toBe("919876543210");
    expect(toWhatsAppDigits("919876543210")).toBe("919876543210");
  });

  it("leaves nothing as nothing", () => {
    expect(toWhatsAppDigits("")).toBe("");
  });
});

describe("toStoredWhatsAppNumber", () => {
  it("saves a legacy bare number with 91 in front", () => {
    expect(toStoredWhatsAppNumber("9876543210")).toBe("919876543210");
    expect(toStoredWhatsAppNumber(" 98765 43210 ")).toBe("919876543210");
  });

  it("saves a number with the country code as typed", () => {
    expect(toStoredWhatsAppNumber("+91 98765 43210")).toBe("+91 98765 43210");
    expect(toStoredWhatsAppNumber("919876543210")).toBe("919876543210");
  });
});
