import { describe, expect, it } from "vitest";

import {
  isPastLastPage,
  PAGE_CODEC,
  toPageNumber,
  toPageTurn,
} from "./page-turn";

describe("toPageTurn", () => {
  it("names the requested page while it loads over the old rows", () => {
    expect(toPageTurn(3, 2, false)).toEqual({ shownPage: 3, failedPage: null });
  });

  it("steps back to the rows on screen when the next page fails", () => {
    expect(toPageTurn(3, 2, true)).toEqual({ shownPage: 2, failedPage: 3 });
  });

  it("keeps the page when a reload of the same page fails", () => {
    expect(toPageTurn(2, 2, true)).toEqual({ shownPage: 2, failedPage: null });
  });

  it("has nothing to step back to before any rows arrived", () => {
    expect(toPageTurn(1, null, true)).toEqual({
      shownPage: 1,
      failedPage: null,
    });
  });
});

describe("isPastLastPage", () => {
  it("is an empty later page of a list that has records", () => {
    expect(isPastLastPage(99, 0, 12)).toBe(true);
  });

  it("is not a page with rows, the first page, or a list with none", () => {
    expect(isPastLastPage(2, 4, 12)).toBe(false);
    expect(isPastLastPage(1, 0, 12)).toBe(false);
    expect(isPastLastPage(99, 0, 0)).toBe(false);
    expect(isPastLastPage(99, 0, undefined)).toBe(false);
  });
});

describe("page in the URL", () => {
  it("reads only whole page numbers past the first", () => {
    expect(toPageNumber("3")).toBe(3);
    for (const raw of [null, "", "1", "0", "-2", "2.5", "two"]) {
      expect(toPageNumber(raw)).toBe(1);
    }
  });

  it("leaves the first page off the query string", () => {
    expect(PAGE_CODEC.serialize(1)).toBe("");
    expect(PAGE_CODEC.serialize(2)).toBe("page=2");
    expect(PAGE_CODEC.parse(new URLSearchParams("page=2"))).toBe(2);
  });
});
