import { describe, expect, it } from "vitest";

import { toCareLines } from "./care";

describe("toCareLines", () => {
  it("joins the pieces into one list in the order they were bought", () => {
    expect(
      toCareLines([
        { care_notes: ["Hand wash", "No microwave"] },
        { care_notes: ["Wipe with a soft cloth"] },
      ]),
    ).toEqual(["Hand wash", "No microwave", "Wipe with a soft cloth"]);
  });

  it("says the same instruction once however many pieces carry it", () => {
    expect(
      toCareLines([
        { care_notes: ["Hand wash"] },
        { care_notes: ["  hand wash  ", "No microwave"] },
      ]),
    ).toEqual(["Hand wash", "No microwave"]);
  });

  it("drops blank lines and returns nothing for a parcel with no notes", () => {
    expect(toCareLines([{ care_notes: ["", "   "] }])).toEqual([]);
    expect(toCareLines([])).toEqual([]);
  });
});
