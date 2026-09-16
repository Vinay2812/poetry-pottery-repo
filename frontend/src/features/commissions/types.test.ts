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
