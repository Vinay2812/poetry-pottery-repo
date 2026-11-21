import { describe, expect, it } from "vitest";

import {
  addRecentSearch,
  MAX_RECENT_SEARCHES,
  nextActiveIndex,
  parseRecentSearches,
  toOptionId,
  toOptionOrder,
  toSearchHint,
  toSearchHref,
} from "./types";

function option(id: string) {
  return { id, label: id, href: `/${id}` };
}

describe("toSearchHref", () => {
  it("escapes the term into the search page's query", () => {
    expect(toSearchHref(" sage green ")).toBe("/search?q=sage%20green");
  });
});

describe("addRecentSearch", () => {
  it("puts the newest term first and keeps five", () => {
    const list = ["a", "b", "c", "d", "e"].reduce(
      addRecentSearch,
      [] as string[],
    );
    expect(list).toEqual(["e", "d", "c", "b", "a"]);
    expect(addRecentSearch(list, "f")).toHaveLength(MAX_RECENT_SEARCHES);
    expect(addRecentSearch(list, "f")[0]).toBe("f");
  });

  it("moves a repeated term up rather than duplicating it", () => {
    expect(addRecentSearch(["mug", "bowl"], "BOWL")).toEqual(["BOWL", "mug"]);
  });

  it("ignores an empty term and collapses whitespace", () => {
    expect(addRecentSearch(["mug"], "   ")).toEqual(["mug"]);
    expect(addRecentSearch([], " blue   mug ")).toEqual(["blue mug"]);
  });
});

describe("parseRecentSearches", () => {
  it("reads back what was written", () => {
    expect(parseRecentSearches(JSON.stringify(["mug", "bowl"]))).toEqual([
      "mug",
      "bowl",
    ]);
  });

  it("survives anything else in the slot", () => {
    expect(parseRecentSearches(null)).toEqual([]);
    expect(parseRecentSearches("not json")).toEqual([]);
    expect(parseRecentSearches(JSON.stringify({ a: 1 }))).toEqual([]);
    expect(parseRecentSearches(JSON.stringify(["mug", 4, "", null]))).toEqual([
      "mug",
    ]);
  });
});

describe("toOptionOrder", () => {
  it("walks recents, then pieces, then evenings, then the wheel", () => {
    const order = toOptionOrder({
      recents: [option("r1")],
      pieces: [option("p1"), option("p2")],
      events: [option("e1")],
      workshops: [option("w1")],
    });
    expect(order.map((entry) => entry.id)).toEqual([
      "r1",
      "p1",
      "p2",
      "e1",
      "w1",
    ]);
  });
});

describe("nextActiveIndex", () => {
  it("wraps at both ends and starts from either end", () => {
    expect(nextActiveIndex(-1, 3, 1)).toBe(0);
    expect(nextActiveIndex(-1, 3, -1)).toBe(2);
    expect(nextActiveIndex(2, 3, 1)).toBe(0);
    expect(nextActiveIndex(0, 3, -1)).toBe(2);
  });

  it("highlights nothing when there is nothing to highlight", () => {
    expect(nextActiveIndex(-1, 0, 1)).toBe(-1);
    expect(nextActiveIndex(2, 0, -1)).toBe(-1);
  });
});

describe("toOptionId", () => {
  it("names an option after its panel and its place in the list", () => {
    expect(toOptionId("panel", 3)).toBe("panel-option-3");
  });
});

describe("toSearchHint", () => {
  const base = { value: "", term: "", isLoading: false, resultCount: 0 };

  it("invites a first word on an empty field", () => {
    expect(toSearchHint(base)).toBe(
      "Type a glaze, a clay body or what you want to use it for.",
    );
  });

  it("offers the full search once there are rows or the word is too short to suggest", () => {
    expect(toSearchHint({ ...base, value: "m" })).toBe(
      "Press Enter to search everything.",
    );
    expect(
      toSearchHint({ ...base, value: "mug", term: "mug", resultCount: 3 }),
    ).toBe("Press Enter to search everything.");
  });

  it("waits while the answer is on its way", () => {
    expect(toSearchHint({ ...base, value: "mug", term: "mu" })).toBe(
      "Looking…",
    );
    expect(
      toSearchHint({ ...base, value: "mug", term: "mug", isLoading: true }),
    ).toBe("Looking…");
  });

  it("names the word that found nothing", () => {
    expect(toSearchHint({ ...base, value: " zzqx ", term: "zzqx" })).toBe(
      "Nothing matches “zzqx”. Try a glaze, a clay body or a shape.",
    );
  });
});
