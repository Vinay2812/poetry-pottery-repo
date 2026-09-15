import { describe, expect, it } from "vitest";

import { applyWishlistToggle } from "./types";

describe("applyWishlistToggle", () => {
  it("adds a piece to the end of the list", () => {
    expect(
      applyWishlistToggle([1, 2], { productId: 3, isWishlisted: true }),
    ).toEqual([1, 2, 3]);
  });

  it("takes a piece back out", () => {
    expect(
      applyWishlistToggle([1, 2, 3], { productId: 2, isWishlisted: false }),
    ).toEqual([1, 3]);
  });

  it("does not add a piece twice", () => {
    expect(
      applyWishlistToggle([1, 2], { productId: 2, isWishlisted: true }),
    ).toEqual([1, 2]);
  });

  it("ignores a removal for a piece that was never saved", () => {
    expect(
      applyWishlistToggle([1, 2], { productId: 9, isWishlisted: false }),
    ).toEqual([1, 2]);
  });

  it("leaves the list it was given alone", () => {
    const ids = [1, 2];
    applyWishlistToggle(ids, { productId: 3, isWishlisted: true });
    expect(ids).toEqual([1, 2]);
  });
});
