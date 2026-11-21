import { describe, expect, it } from "vitest";

import {
  applyQueryPatch,
  formatEnumLabel,
  formatRange,
  toPreviousPage,
  isNavLinkActive,
  readPage,
  readQueryValues,
  toPageNumber,
  toQueryString,
} from "./types";

describe("isNavLinkActive", () => {
  it("matches the dashboard root exactly", () => {
    expect(isNavLinkActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavLinkActive("/dashboard/orders", "/dashboard")).toBe(false);
  });

  it("matches a section and everything under it", () => {
    expect(isNavLinkActive("/dashboard/orders", "/dashboard/orders")).toBe(
      true,
    );
    expect(isNavLinkActive("/dashboard/orders/abc", "/dashboard/orders")).toBe(
      true,
    );
    expect(isNavLinkActive("/dashboard/ordersx", "/dashboard/orders")).toBe(
      false,
    );
  });
});

describe("readQueryValues", () => {
  it("drops empty values", () => {
    const search = new URLSearchParams("search=mug&status=&page=2");
    expect(readQueryValues(search)).toEqual({ search: "mug", page: "2" });
  });
});

describe("applyQueryPatch", () => {
  it("resets the page when a filter changes", () => {
    expect(
      applyQueryPatch({ page: "4", search: "mug" }, { status: "PAID" }),
    ).toEqual({ search: "mug", status: "PAID" });
  });

  it("keeps the page when the page itself moves", () => {
    expect(applyQueryPatch({ page: "4" }, { page: "5" })).toEqual({
      page: "5",
    });
  });

  it("removes a value set to null or empty", () => {
    expect(applyQueryPatch({ status: "PAID" }, { status: null })).toEqual({});
    expect(applyQueryPatch({ status: "PAID" }, { status: "" })).toEqual({});
  });
});

describe("toQueryString", () => {
  it("sorts keys so the same filters always produce the same URL", () => {
    expect(toQueryString({ status: "PAID", page: "2" })).toBe(
      "page=2&status=PAID",
    );
  });
});

describe("toPageNumber", () => {
  it("reads a page number, defaulting to one", () => {
    expect(toPageNumber("3")).toBe(3);
    expect(toPageNumber(undefined)).toBe(1);
    expect(toPageNumber("0")).toBe(1);
    expect(toPageNumber("-2")).toBe(1);
    expect(toPageNumber("later")).toBe(1);
  });
});

describe("readPage", () => {
  it("falls back to the first page", () => {
    expect(readPage({})).toBe(1);
    expect(readPage({ page: "0" })).toBe(1);
    expect(readPage({ page: "nope" })).toBe(1);
    expect(readPage({ page: "3" })).toBe(3);
  });
});

describe("formatEnumLabel", () => {
  it("reads enum members as sentences", () => {
    expect(formatEnumLabel("PENDING")).toBe("Pending");
    expect(formatEnumLabel("OPEN_MIC")).toBe("Open mic");
    expect(formatEnumLabel("")).toBe("");
  });
});

describe("formatRange", () => {
  it("describes the slice on screen", () => {
    expect(formatRange(1, 20, 132)).toBe("1–20 of 132");
    expect(formatRange(7, 20, 132)).toBe("121–132 of 132");
  });

  it("has no count line for a page with no rows on it", () => {
    expect(formatRange(1, 20, 0)).toBeNull();
    expect(formatRange(3, 20, 0)).toBeNull();
    expect(formatRange(7, 20, 120)).toBeNull();
  });
});

describe("toPreviousPage", () => {
  it("steps back one page", () => {
    expect(toPreviousPage(4, 20, 132)).toBe(3);
    expect(toPreviousPage(1, 20, 132)).toBe(1);
  });

  it("steps back to the last real page from one past the end", () => {
    expect(toPreviousPage(9, 20, 132)).toBe(7);
    expect(toPreviousPage(7, 20, 120)).toBe(6);
  });

  it("goes back to the start when the list is empty", () => {
    expect(toPreviousPage(3, 20, 0)).toBe(1);
  });
});
