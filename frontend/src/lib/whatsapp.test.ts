import { describe, expect, it } from "vitest";

import {
  buildOptionalWhatsAppUrl,
  buildWhatsAppUrl,
  toStoredWhatsAppNumber,
  toWhatsAppDigits,
} from "./whatsapp";

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

describe("buildOptionalWhatsAppUrl", () => {
  it("builds the same link, or nothing when there is no number to send to", () => {
    expect(buildOptionalWhatsAppUrl("91234 56789", "Hi")).toBe(
      buildWhatsAppUrl("91234 56789", "Hi"),
    );
    expect(buildOptionalWhatsAppUrl("", "Hi")).toBeNull();
    expect(buildOptionalWhatsAppUrl("n/a", "Hi")).toBeNull();
  });
});

describe("buildWhatsAppUrl", () => {
  it("strips formatting and encodes the message", () => {
    expect(buildWhatsAppUrl("+91 91234 56789", "Hi there")).toBe(
      "https://wa.me/919123456789?text=Hi%20there",
    );
  });

  it("puts 91 in front of a legacy 10-digit number", () => {
    expect(buildWhatsAppUrl("91234 56789", "Hi")).toBe(
      "https://wa.me/919123456789?text=Hi",
    );
  });
});
