import { describe, expect, it } from "vitest";

import {
  abandonPage,
  dropTrail,
  joinPages,
  type PageTrails,
  settlePage,
  startPage,
  toNextPageNumber,
  toPageTrail,
} from "./page-trail";

interface List {
  items: number[];
  page_info: { page: number; has_more: boolean };
  facets: string;
}

const list = (items: number[], page: number, hasMore: boolean): List => ({
  items,
  page_info: { page, has_more: hasMore },
  facets: `facets ${page}`,
});

const FIRST = list([1, 2], 1, true);
const SECOND = list([3, 4], 2, true);
const THIRD = list([5], 3, false);

describe("page trail", () => {
  it("starts empty for a key it has not seen", () => {
    expect(toPageTrail<List>({}, "mugs")).toEqual({ pages: [], next: null });
  });

  it("joins a page that lands for the request still out", () => {
    const asked = startPage<List>({}, "mugs", 2);
    expect(toPageTrail(asked, "mugs").next).toEqual({
      page: 2,
      status: "loading",
    });

    const landed = settlePage(asked, "mugs", 2, SECOND);
    expect(toPageTrail(landed, "mugs")).toEqual({
      pages: [SECOND],
      next: null,
    });
  });

  it("keeps a failed page so it can be asked again", () => {
    const failed = settlePage(startPage<List>({}, "mugs", 2), "mugs", 2, null);
    expect(toPageTrail(failed, "mugs")).toEqual({
      pages: [],
      next: { page: 2, status: "failed" },
    });
  });

  it("ignores an answer the key is no longer waiting on", () => {
    const landed = settlePage(
      startPage<List>({}, "mugs", 2),
      "mugs",
      2,
      SECOND,
    );

    expect(settlePage(landed, "mugs", 2, SECOND)).toBe(landed);
    expect(settlePage(landed, "bowls", 2, SECOND)).toBe(landed);
    const dropped = dropTrail(startPage<List>({}, "mugs", 2), "mugs");
    expect(settlePage(dropped, "mugs", 2, SECOND)).toBe(dropped);
  });

  it("lets a request go without joining its page", () => {
    const joined = settlePage(
      startPage<List>({}, "mugs", 2),
      "mugs",
      2,
      SECOND,
    );
    const abandoned = abandonPage(startPage(joined, "mugs", 3), "mugs", 3);

    expect(toPageTrail(abandoned, "mugs")).toEqual({
      pages: [SECOND],
      next: null,
    });
    expect(abandonPage(abandoned, "mugs", 3)).toBe(abandoned);
  });

  it("keeps each key's pages apart", () => {
    let trails: PageTrails<List> = startPage({}, "mugs", 2);
    trails = startPage(trails, "bowls", 2);
    trails = settlePage(trails, "bowls", 2, SECOND);

    expect(toPageTrail(trails, "mugs").pages).toEqual([]);
    expect(toPageTrail(trails, "bowls").pages).toEqual([SECOND]);
    expect(Object.keys(dropTrail(trails, "bowls"))).toEqual(["mugs"]);
  });
});

describe("toNextPageNumber", () => {
  it("follows the newest page that joined", () => {
    expect(toNextPageNumber(FIRST, { pages: [], next: null })).toBe(2);
    expect(toNextPageNumber(FIRST, { pages: [SECOND], next: null })).toBe(3);
  });

  it("has nothing to ask for at the end or before a first page", () => {
    expect(
      toNextPageNumber(FIRST, { pages: [SECOND, THIRD], next: null }),
    ).toBeNull();
    expect(toNextPageNumber(undefined, { pages: [], next: null })).toBeNull();
  });
});

describe("joinPages", () => {
  it("adds the joined items after the first page's and takes the newest page_info", () => {
    const joined = joinPages(FIRST, { pages: [SECOND, THIRD], next: null });

    expect(joined?.items).toEqual([1, 2, 3, 4, 5]);
    expect(joined?.page_info).toEqual({ page: 3, has_more: false });
    expect(joined?.facets).toBe("facets 1");
  });

  it("returns the first page untouched when nothing joined, or nothing without one", () => {
    expect(joinPages(FIRST, { pages: [], next: null })).toBe(FIRST);
    expect(
      joinPages(undefined, { pages: [SECOND], next: null }),
    ).toBeUndefined();
  });
});
