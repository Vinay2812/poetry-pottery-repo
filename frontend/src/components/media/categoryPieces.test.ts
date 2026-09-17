import { describe, expect, it } from "vitest";

import { parsePath } from "@/lib/drawing/vessel";

import {
  toCategoryPiece,
  toCategoryPieceKind,
  type CategoryPieceKind,
} from "./categoryPieces";

describe("toCategoryPieceKind", () => {
  it("draws the piece each seeded category is named after", () => {
    expect(toCategoryPieceKind("mugs")).toBe("mug");
    expect(toCategoryPieceKind("bowls")).toBe("bowl");
    expect(toCategoryPieceKind("plates")).toBe("plate");
    expect(toCategoryPieceKind("vases")).toBe("vase");
    expect(toCategoryPieceKind("planters")).toBe("planter");
    expect(toCategoryPieceKind("serveware")).toBe("serving-dish");
    expect(toCategoryPieceKind("accessories")).toBe("accessories");
    expect(toCategoryPieceKind("wood-fired")).toBe("wood-fired");
  });

  it("reads a name as happily as a slug", () => {
    expect(toCategoryPieceKind("Wood Fired")).toBe("wood-fired");
    expect(toCategoryPieceKind("Serving Dishes")).toBe("serving-dish");
    expect(toCategoryPieceKind("Tea Cups")).toBe("mug");
  });

  it("lets the shape named first win, so serving bowls are bowls", () => {
    expect(toCategoryPieceKind("serving-dishes")).toBe("serving-dish");
    expect(toCategoryPieceKind("platters")).toBe("serving-dish");
    expect(toCategoryPieceKind("serving-bowls")).toBe("bowl");
  });

  it("falls back to a small piece for a category with no shape", () => {
    expect(toCategoryPieceKind("gift-cards")).toBe("small-things");
    expect(toCategoryPieceKind("")).toBe("small-things");
  });
});

const KINDS: CategoryPieceKind[] = [
  "mug",
  "bowl",
  "plate",
  "vase",
  "planter",
  "serving-dish",
  "small-things",
  "accessories",
  "wood-fired",
];

describe("toCategoryPiece", () => {
  it("draws every kind with clay, hatching and an outline", () => {
    for (const kind of KINDS) {
      const [main, ...rest] = toCategoryPiece(kind).elements;
      expect(main.body.startsWith("M")).toBe(true);
      expect(main.hatch.length).toBeGreaterThan(0);
      expect(main.outline.length).toBeGreaterThan(0);
      for (const element of rest) {
        expect(element.body.startsWith("M")).toBe(true);
        expect(element.outline.length).toBeGreaterThan(0);
      }
    }
  });

  it("thins the hatching out, so a 64px tile does not silt up", () => {
    const tile = toCategoryPiece("bowl").elements[0].hatch;

    expect(tile.length).toBeLessThan(40);
  });

  it("flashes the wood-fired bottle on one side instead of glazing it", () => {
    const [bottle] = toCategoryPiece("wood-fired").elements;

    expect(bottle.glaze).toBeNull();
    expect(bottle.flash?.strokes.length).toBeGreaterThan(0);
    expect(bottle.flash?.cx).toBeGreaterThan(100);
  });

  it("stands the ring post in the dish, drawn after it", () => {
    const [dish, post] = toCategoryPiece("accessories").elements;

    expect(dish.glaze).not.toBeNull();
    expect(post.mouth.inner).toBeNull();
    expect(parsePath(post.body).start[1]).toBeLessThan(
      parsePath(dish.body).start[1],
    );
  });
});
