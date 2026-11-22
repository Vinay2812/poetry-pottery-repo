import { describe, expect, it } from "vitest";

import {
  buildOptionalWhatsAppUrl,
  buildWhatsAppUrl,
  formatBadgeCount,
  isActivePath,
  isFocusedPath,
  toCartAnnouncement,
  toFocusedHeader,
  toWhatsAppBody,
  toWishlistAnnouncement,
} from "./types";

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

describe("toWhatsAppBody", () => {
  it("reads the prefilled text back out of a wa.me link", () => {
    expect(toWhatsAppBody(buildWhatsAppUrl("9123456789", "Hi there"))).toBe(
      "Hi there",
    );
  });

  it("returns null without a text param or a parseable link", () => {
    expect(toWhatsAppBody("https://wa.me/919123456789")).toBeNull();
    expect(toWhatsAppBody("https://wa.me/919123456789?text=%20")).toBeNull();
    expect(toWhatsAppBody("not a url")).toBeNull();
  });
});

describe("formatBadgeCount", () => {
  it("caps at 9+", () => {
    expect(formatBadgeCount(3)).toBe("3");
    expect(formatBadgeCount(12)).toBe("9+");
  });
});

describe("isFocusedPath", () => {
  it("is true on checkout only", () => {
    expect(isFocusedPath("/checkout")).toBe(true);
    expect(isFocusedPath("/cart")).toBe(false);
    expect(isFocusedPath("/")).toBe(false);
  });
});

describe("toFocusedHeader", () => {
  it("gives checkout one way back", () => {
    expect(toFocusedHeader("/checkout")).toEqual({
      href: "/cart",
      label: "Back to cart",
    });
  });

  it("leaves every other route, including the cart, with the full header", () => {
    expect(toFocusedHeader("/")).toBeNull();
    expect(toFocusedHeader("/cart")).toBeNull();
    expect(toFocusedHeader("/orders")).toBeNull();
    expect(toFocusedHeader("/checkout/extra")).toBeNull();
  });
});

describe("toCartAnnouncement", () => {
  it("counts pieces, and says so when there are none", () => {
    expect(toCartAnnouncement(0)).toBe("Your cart is empty");
    expect(toCartAnnouncement(1)).toBe("1 piece in your cart");
    expect(toCartAnnouncement(4)).toBe("4 pieces in your cart");
  });
});

describe("toWishlistAnnouncement", () => {
  it("counts saved pieces, and says so when there are none", () => {
    expect(toWishlistAnnouncement(0)).toBe("Nothing saved yet");
    expect(toWishlistAnnouncement(1)).toBe("1 piece saved");
    expect(toWishlistAnnouncement(7)).toBe("7 pieces saved");
  });
});
