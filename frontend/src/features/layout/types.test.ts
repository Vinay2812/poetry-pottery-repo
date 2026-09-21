import { describe, expect, it } from "vitest";

import {
  buildWhatsAppUrl,
  formatBadgeCount,
  isActiveLink,
  isActivePath,
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

describe("isActiveLink", () => {
  it("tells the shelf and the archive apart", () => {
    expect(isActiveLink("/products", "archive", "/products")).toBe(false);
    expect(isActiveLink("/products", "archive", "/products?view=archive")).toBe(
      true,
    );
    expect(isActiveLink("/products", null, "/products")).toBe(true);
    expect(isActiveLink("/products", null, "/products?view=archive")).toBe(
      false,
    );
  });

  it("ignores query keys other than the view", () => {
    expect(isActiveLink("/products", null, "/products?sort=NEWEST")).toBe(true);
  });

  it("still requires the path to match", () => {
    expect(isActiveLink("/custom", "archive", "/products?view=archive")).toBe(
      false,
    );
  });
});

describe("buildWhatsAppUrl", () => {
  it("strips formatting and encodes the message", () => {
    expect(buildWhatsAppUrl("+91 91234 56789", "Hi there")).toBe(
      "https://wa.me/919123456789?text=Hi%20there",
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
