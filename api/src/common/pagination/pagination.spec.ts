import { describe, expect, it } from "vitest";

import { clampPage, MAX_PAGE_SIZE, toPageInfo } from "./pagination";

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
