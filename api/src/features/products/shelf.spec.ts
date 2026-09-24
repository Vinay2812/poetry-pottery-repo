import { describe, expect, it } from "vitest";

import { becameBuyable, isBuyable } from "./shelf";

const listed = { is_active: true, stock: 0, is_customizable: false };

describe("isBuyable", () => {
  it("needs a listing plus either stock or a made-to-order flag", () => {
    expect(isBuyable({ ...listed, stock: 1 })).toBe(true);
    expect(isBuyable({ ...listed, is_customizable: true })).toBe(true);
    expect(isBuyable(listed)).toBe(false);
    expect(isBuyable({ ...listed, stock: 5, is_active: false })).toBe(false);
  });
});

describe("becameBuyable", () => {
  it("fires when stock comes back on a listed piece", () => {
    expect(becameBuyable(listed, { ...listed, stock: 3 })).toBe(true);
    expect(
      becameBuyable({ ...listed, stock: -1 }, { ...listed, stock: 1 }),
    ).toBe(true);
  });

  it("fires when a stocked piece is listed again", () => {
    expect(
      becameBuyable(
        { ...listed, stock: 3, is_active: false },
        { ...listed, stock: 3 },
      ),
    ).toBe(true);
  });

  it("fires when a sold-out piece becomes made to order", () => {
    expect(becameBuyable(listed, { ...listed, is_customizable: true })).toBe(
      true,
    );
  });

  it("stays quiet when the shelf was never bare", () => {
    expect(
      becameBuyable({ ...listed, stock: 2 }, { ...listed, stock: 5 }),
    ).toBe(false);
    expect(
      becameBuyable({ ...listed, stock: 1 }, { ...listed, stock: 1 }),
    ).toBe(false);
  });

  it("stays quiet when the piece is still not buyable", () => {
    expect(becameBuyable(listed, listed)).toBe(false);
    expect(becameBuyable({ ...listed, stock: 3 }, listed)).toBe(false);
    expect(
      becameBuyable(
        { ...listed, is_active: false },
        { ...listed, stock: 3, is_active: false },
      ),
    ).toBe(false);
  });
});
