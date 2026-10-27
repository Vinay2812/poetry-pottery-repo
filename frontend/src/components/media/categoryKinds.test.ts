import { describe, expect, it } from "vitest";

import {
  CATEGORY_PIECE_KINDS,
  CATEGORY_PIECE_OPTIONS,
  isCategoryPieceKind,
} from "./categoryKinds";

describe("isCategoryPieceKind", () => {
  it("knows every drawing the picker offers", () => {
    for (const kind of CATEGORY_PIECE_KINDS) {
      expect(isCategoryPieceKind(kind)).toBe(true);
    }
  });

  it("refuses free text and inherited object keys", () => {
    expect(isCategoryPieceKind("teapot")).toBe(false);
    expect(isCategoryPieceKind("")).toBe(false);
    expect(isCategoryPieceKind("toString")).toBe(false);
  });
});

describe("CATEGORY_PIECE_OPTIONS", () => {
  it("lists the everyday shapes first and the catch-all last", () => {
    expect(CATEGORY_PIECE_OPTIONS[0]).toEqual({ kind: "mug", label: "Mug" });
    expect(CATEGORY_PIECE_OPTIONS.at(-1)?.kind).toBe("small-things");
    expect(CATEGORY_PIECE_OPTIONS).toHaveLength(9);
  });
});
