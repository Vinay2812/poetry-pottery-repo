import { describe, expect, it } from "vitest";

import {
  type CommissionFormValues,
  EMPTY_COMMISSION_FORM,
} from "@/lib/validations/commission";

import {
  COMMISSION_STEPS,
  toBriefSummary,
  toCommissionAskUrl,
  toCommissionInput,
  toCommissionMessage,
  toGlazeChoices,
  toPieceChoices,
  toReferenceBrief,
  toReferenceLine,
  toSizesForPiece,
} from "./types";

function values(
  overrides: Partial<CommissionFormValues> = {},
): CommissionFormValues {
  return {
    ...EMPTY_COMMISSION_FORM,
    pieceType: "Mug",
    size: "Short (150 ml)",
    glaze: "Ocean Blue",
    name: "Maya",
    email: "maya@example.com",
    ...overrides,
  };
}

describe("COMMISSION_STEPS", () => {
  it("runs brief, sketch, throw, fire, ship in that order", () => {
    expect(COMMISSION_STEPS).toHaveLength(5);
    expect(COMMISSION_STEPS[0]?.title).toContain("brief");
    expect(COMMISSION_STEPS[1]?.detail).toContain("price");
    expect(COMMISSION_STEPS[4]?.title).toContain("ten days");
  });
});

describe("toCommissionInput", () => {
  it("sends the optional fields as null rather than empty strings", () => {
    expect(toCommissionInput(values(), [])).toEqual({
      piece_type: "Mug",
      size: "Short (150 ml)",
      glaze: "Ocean Blue",
      carved_words: null,
      notes: null,
      name: "Maya",
      email: "maya@example.com",
      phone: null,
      reference_image_urls: [],
    });
  });

  it("carries the words, the notes, the phone and the confirmed photos", () => {
    const input = toCommissionInput(
      values({
        carvedWords: "for Aai",
        notes: "Deep blue",
        phone: "9123456789",
      }),
      ["https://cdn.studio/a.jpg"],
    );
    expect(input.carved_words).toBe("for Aai");
    expect(input.notes).toBe("Deep blue");
    expect(input.phone).toBe("9123456789");
    expect(input.reference_image_urls).toEqual(["https://cdn.studio/a.jpg"]);
  });
});

describe("toCommissionMessage", () => {
  it("writes out only the lines that have been filled in", () => {
    expect(toCommissionMessage(values())).toBe(
      [
        "Hi, I would like a piece made to order.",
        "Piece: Mug",
        "Size: Short (150 ml)",
        "Glaze: Ocean Blue",
      ].join("\n"),
    );
  });

  it("still says something useful before anything is typed", () => {
    expect(toCommissionMessage(EMPTY_COMMISSION_FORM)).toBe(
      "Hi, I would like a piece made to order.",
    );
  });
});

describe("toCommissionAskUrl", () => {
  it("encodes the brief into a wa.me link", () => {
    const url = toCommissionAskUrl("+91 90000 00000", values());
    expect(url).toContain("https://wa.me/919000000000?text=");
    expect(decodeURIComponent(url ?? "")).toContain("Glaze: Ocean Blue");
  });

  it("offers nothing when the studio has no WhatsApp number", () => {
    expect(toCommissionAskUrl("", values())).toBeNull();
    expect(toCommissionAskUrl("   ", values())).toBeNull();
  });
});

describe("toBriefSummary", () => {
  it("joins the three facts with middots and drops the blanks", () => {
    expect(toBriefSummary("Mug", "Short (150 ml)", "Ocean Blue")).toBe(
      "Mug · Short (150 ml) · Ocean Blue",
    );
    expect(toBriefSummary("Mug", "  ", "Ocean Blue")).toBe("Mug · Ocean Blue");
  });
});

describe("toGlazeChoices", () => {
  it("carries the glaze table's own name, slug and colour to the form", () => {
    expect(
      toGlazeChoices([
        { slug: "ocean-blue", name: "Ocean Blue", color_code: "#2F5D7C" },
        { slug: "multan", name: "Multan", color_code: null },
      ]),
    ).toEqual([
      { slug: "ocean-blue", name: "Ocean Blue", colorCode: "#2F5D7C" },
      { slug: "multan", name: "Multan", colorCode: null },
    ]);
  });

  it("has nothing to offer when the studio lists no glazes", () => {
    expect(toGlazeChoices([])).toEqual([]);
  });
});

describe("toPieceChoices", () => {
  it("copies each piece with its own sizes", () => {
    expect(
      toPieceChoices([
        { name: "Mugs", sizes: ["Short (150 ml)"] },
        { name: "Bowls", sizes: [] },
      ]),
    ).toEqual([
      { name: "Mugs", sizes: ["Short (150 ml)"] },
      { name: "Bowls", sizes: [] },
    ]);
  });
});

describe("toSizesForPiece", () => {
  const pieces = [
    { name: "Mugs", sizes: ["Espresso (30 ml)", "Short (150 ml)"] },
    { name: "Bowls", sizes: [] },
  ];

  it("offers the sizes of the chosen piece only", () => {
    expect(toSizesForPiece(pieces, "Mugs")).toEqual([
      "Espresso (30 ml)",
      "Short (150 ml)",
    ]);
    expect(toSizesForPiece(pieces, "Bowls")).toEqual([]);
  });

  it("has no sizes for a piece the studio does not list", () => {
    expect(toSizesForPiece(pieces, "Lamp")).toEqual([]);
    expect(toSizesForPiece(pieces, "")).toEqual([]);
  });
});

describe("toReferenceBrief", () => {
  const pieces = [{ name: "Mugs", sizes: ["Short (150 ml)"] }];
  const piece = {
    name: "Drip sip mug",
    url: "https://studio.test/products/drip-sip-mug",
    categoryName: "Mugs",
  };

  it("picks the piece's kind when the studio lists it and names it in the notes", () => {
    expect(toReferenceBrief(piece, pieces)).toEqual({
      pieceType: "Mugs",
      notes:
        "Like the Drip sip mug from your archive: https://studio.test/products/drip-sip-mug",
    });
  });

  it("leaves the kind open when it is not one the studio throws to order", () => {
    expect(
      toReferenceBrief({ ...piece, categoryName: "Wall pieces" }, pieces)
        .pieceType,
    ).toBe("");
    expect(
      toReferenceBrief({ ...piece, categoryName: null }, pieces).pieceType,
    ).toBe("");
  });
});

describe("toReferenceLine", () => {
  it("says which piece the brief is measured against", () => {
    expect(
      toReferenceLine({ name: "Drip sip mug", url: "", categoryName: null }),
    ).toBe("Asking for one like the Drip sip mug.");
  });
});
