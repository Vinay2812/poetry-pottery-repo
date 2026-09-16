import { describe, expect, it } from "vitest";

import { cameBackInStock } from "./restock";

describe("cameBackInStock", () => {
  it("fires only on the edge out of nothing", () => {
    expect(cameBackInStock(0, 3)).toBe(true);
    expect(cameBackInStock(-1, 1)).toBe(true);
  });

  it("stays quiet when the shelf was never empty", () => {
    expect(cameBackInStock(2, 5)).toBe(false);
    expect(cameBackInStock(1, 1)).toBe(false);
  });

  it("stays quiet when the shelf is still empty", () => {
    expect(cameBackInStock(0, 0)).toBe(false);
    expect(cameBackInStock(3, 0)).toBe(false);
  });
});
