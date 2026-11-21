import { describe, expect, it } from "vitest";

import {
  canReturnRows,
  clampPage,
  MAX_PAGE_SIZE,
  splitPage,
  toPageInfo,
} from "./pagination";

describe("clampPage", () => {
  it("defaults and computes skip", () => {
    expect(clampPage(undefined, undefined)).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
    });
    expect(clampPage(3, 10)).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  it("clamps out-of-range values", () => {
    expect(clampPage(-2, 5000)).toEqual({
      page: 1,
      limit: MAX_PAGE_SIZE,
      skip: 0,
    });
    expect(clampPage(2.9, 0.4)).toEqual({ page: 2, limit: 1, skip: 1 });
  });
});

describe("toPageInfo", () => {
  it("reports whether another page exists", () => {
    expect(toPageInfo(clampPage(1, 10), 25).has_more).toBe(true);
    expect(toPageInfo(clampPage(3, 10), 25).has_more).toBe(false);
  });
});

describe("splitPage", () => {
  const page = (number: number) => ({
    page: number,
    limit: 12,
    skip: (number - 1) * 12,
  });

  it("fills a page from the first list, then tops it up from the second", () => {
    expect(splitPage(page(1), 3)).toEqual({
      first: { skip: 0, take: 3 },
      second: { skip: 0, take: 9 },
    });
  });

  it("picks the second list up where the first page left it", () => {
    expect(splitPage(page(2), 3)).toEqual({
      first: { skip: 3, take: 0 },
      second: { skip: 9, take: 12 },
    });
  });

  it("stays in the first list while it still has a full page", () => {
    expect(splitPage(page(1), 30)).toEqual({
      first: { skip: 0, take: 12 },
      second: { skip: 0, take: 0 },
    });
    expect(splitPage(page(3), 30)).toEqual({
      first: { skip: 24, take: 6 },
      second: { skip: 0, take: 6 },
    });
  });

  it("goes straight to the second list when the first is empty", () => {
    expect(splitPage(page(1), 0)).toEqual({
      first: { skip: 0, take: 0 },
      second: { skip: 0, take: 12 },
    });
  });

  it("points a page past both lists beyond the second list's end", () => {
    // With 3 ahead and 14 behind there are 17 rows; page five starts at row 48.
    expect(splitPage(page(5), 3)).toEqual({
      first: { skip: 3, take: 0 },
      second: { skip: 45, take: 12 },
    });
  });
});

describe("canReturnRows", () => {
  it("sends a read only when the slice starts inside the list", () => {
    expect(canReturnRows({ skip: 0, take: 12 }, 3)).toBe(true);
    expect(canReturnRows({ skip: 3, take: 0 }, 3)).toBe(false);
    expect(canReturnRows({ skip: 45, take: 12 }, 14)).toBe(false);
    expect(canReturnRows({ skip: 0, take: 12 }, 0)).toBe(false);
  });
});
