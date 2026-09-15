import { describe, expect, it } from "vitest";

import { buildWhatsAppUrl, formatBadgeCount, isActivePath } from "./types";

describe("isActivePath", () => {
  it("matches the section and its children", () => {
    expect(isActivePath("/products", "/products")).toBe(true);
    expect(isActivePath("/products/mug", "/products")).toBe(true);
    expect(isActivePath("/products-extra", "/products")).toBe(false);
    expect(isActivePath("/", "/products")).toBe(false);
  });

  it("ignores query strings on the link", () => {
    expect(isActivePath("/products", "/products?sort=NEWEST")).toBe(true);
  });

  it("only matches home exactly", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/cart", "/")).toBe(false);
  });
});

describe("buildWhatsAppUrl", () => {
  it("strips formatting and encodes the message", () => {
    expect(buildWhatsAppUrl("+91 91234 56789", "Hi there")).toBe(
      "https://wa.me/919123456789?text=Hi%20there",
    );
  });
});

describe("formatBadgeCount", () => {
  it("caps at 9+", () => {
    expect(formatBadgeCount(3)).toBe("3");
    expect(formatBadgeCount(12)).toBe("9+");
  });
});
