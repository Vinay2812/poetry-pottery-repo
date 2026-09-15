import { OptionGroupKind } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  type OptionGroupRow,
  resolveSelections,
  selectionKey,
  selectionsTotal,
} from "./selections";

const groups: OptionGroupRow[] = [
  {
    id: 1,
    name: "Size",
    kind: OptionGroupKind.CHOICE,
    is_required: true,
    price_modifier: 0,
    max_length: null,
    options: [
      { id: 10, name: "Regular", price_modifier: 0, is_active: true },
      { id: 11, name: "Large", price_modifier: 150, is_active: true },
      { id: 12, name: "Retired", price_modifier: 0, is_active: false },
    ],
  },
  {
    id: 2,
    name: "Carved text",
    kind: OptionGroupKind.TEXT,
    is_required: false,
    price_modifier: 100,
    max_length: 5,
    options: [],
  },
];

describe("resolveSelections", () => {
  it("prices choices and text from the live rows", () => {
    const result = resolveSelections(groups, [
      { group_id: 1, option_id: 11 },
      { group_id: 2, text: " Maya " },
    ]);

    expect(result).toEqual([
      {
        group_id: 1,
        group_name: "Size",
        option_id: 11,
        option_name: "Large",
        text: null,
        price_modifier: 150,
      },
      {
        group_id: 2,
        group_name: "Carved text",
        option_id: null,
        option_name: null,
        text: "Maya",
        price_modifier: 100,
      },
    ]);
    expect(selectionsTotal(result)).toBe(250);
  });

  it("skips optional text left empty", () => {
    const result = resolveSelections(groups, [{ group_id: 1, option_id: 10 }]);
    expect(result).toHaveLength(1);
  });

  it("rejects missing required, inactive, overlong and unknown inputs", () => {
    expect(() => resolveSelections(groups, [])).toThrow("Choose a size");
    expect(() =>
      resolveSelections(groups, [{ group_id: 1, option_id: 12 }]),
    ).toThrow("no longer available");
    expect(() =>
      resolveSelections(groups, [
        { group_id: 1, option_id: 10 },
        { group_id: 2, text: "Toolong" },
      ]),
    ).toThrow("5 characters");
    expect(() =>
      resolveSelections(groups, [
        { group_id: 1, option_id: 10 },
        { group_id: 9, option_id: 1 },
      ]),
    ).toThrow("Unknown");
  });
});

describe("selectionKey", () => {
  it("is order independent and empty for no selections", () => {
    const a = resolveSelections(groups, [
      { group_id: 1, option_id: 11 },
      { group_id: 2, text: "Maya" },
    ]);
    const b = resolveSelections(groups, [
      { group_id: 2, text: "Maya" },
      { group_id: 1, option_id: 11 },
    ]);
    expect(selectionKey(a)).toBe(selectionKey(b));
    expect(selectionKey(a)).toHaveLength(32);
    expect(selectionKey([])).toBe("");
  });
});
