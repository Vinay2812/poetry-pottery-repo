import { describe, expect, it } from "vitest";

import {
  applyGlazePatch,
  canDeleteGlaze,
  describeGlazeDeletion,
  describePieces,
  type GlazeRow,
  toGlazeFormValues,
  toGlazeInput,
  toGlazeRow,
} from "./types";

function row(overrides: Partial<GlazeRow> = {}): GlazeRow {
  return {
    id: 1,
    slug: "kiln-ash",
    name: "Kiln ash",
    description: "A soft grey-green.",
    variationNote: "",
    swatchUrl: null,
    colorCode: "#6f7d6b",
    productCount: 0,
    ...overrides,
  };
}

describe("toGlazeRow", () => {
  it("flattens the glaze and its count, turning nulls into empty text", () => {
    expect(
      toGlazeRow({
        glaze: {
          id: 4,
          slug: "kiln-ash",
          name: "Kiln ash",
          description: "A soft grey-green.",
          variation_note: null,
          swatch_url: null,
          color_code: null,
        },
        product_count: 3,
      }),
    ).toEqual({
      id: 4,
      slug: "kiln-ash",
      name: "Kiln ash",
      description: "A soft grey-green.",
      variationNote: "",
      swatchUrl: null,
      colorCode: null,
      productCount: 3,
    });
  });
});

describe("toGlazeInput", () => {
  it("sends an empty variation note and colour as null", () => {
    expect(
      toGlazeInput(
        {
          name: "  Kiln ash  ",
          description: "  A soft grey-green.  ",
          variation_note: "   ",
          color_code: "",
        },
        null,
      ),
    ).toEqual({
      name: "Kiln ash",
      description: "A soft grey-green.",
      variation_note: null,
      color_code: null,
      swatch_url: null,
    });
  });

  it("carries the swatch the uploader confirmed", () => {
    expect(
      toGlazeInput(
        {
          name: "Kiln ash",
          description: "A soft grey-green.",
          variation_note: "No two pots pool the same.",
          color_code: "#6F7D6B",
        },
        "https://cdn.test/glazes/ash.png",
      ),
    ).toMatchObject({
      swatch_url: "https://cdn.test/glazes/ash.png",
      variation_note: "No two pots pool the same.",
      color_code: "#6F7D6B",
    });
  });
});

describe("toGlazeFormValues", () => {
  it("reads a row back into the form", () => {
    expect(toGlazeFormValues(row({ colorCode: null }))).toEqual({
      name: "Kiln ash",
      description: "A soft grey-green.",
      variation_note: "",
      color_code: "",
    });
  });
});

describe("describePieces", () => {
  it("counts the pieces wearing the glaze", () => {
    expect(describePieces(0)).toBe("None yet");
    expect(describePieces(1)).toBe("1 piece");
    expect(describePieces(4)).toBe("4 pieces");
  });
});

describe("describeGlazeDeletion", () => {
  it("warns when pieces still wear it", () => {
    expect(describeGlazeDeletion("Kiln ash", 0)).toContain("cannot be undone");
    expect(describeGlazeDeletion("Kiln ash", 2)).toContain("2 pieces");
    expect(canDeleteGlaze(0)).toBe(true);
    expect(canDeleteGlaze(2)).toBe(false);
  });
});

describe("applyGlazePatch", () => {
  it("adds an unknown row at the top and replaces a known one", () => {
    const rows = [row({ id: 1 }), row({ id: 2, name: "Ink" })];

    expect(
      applyGlazePatch(rows, {
        kind: "save",
        row: row({ id: 9, name: "Bone" }),
      }),
    ).toHaveLength(3);
    expect(
      applyGlazePatch(rows, {
        kind: "save",
        row: row({ id: 2, name: "Bone" }),
      })[1]?.name,
    ).toBe("Bone");
  });

  it("drops a removed row", () => {
    expect(
      applyGlazePatch([row({ id: 1 }), row({ id: 2 })], {
        kind: "remove",
        id: 1,
      }),
    ).toHaveLength(1);
  });
});
