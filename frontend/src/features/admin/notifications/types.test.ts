import { describe, expect, it } from "vitest";

import {
  NOTIFICATIONS_PAGE_SIZE,
  toNotificationsExportFilter,
  toNotificationsFilter,
  toNotifiedFilter,
  toWatcherRow,
  toWatchersCsvName,
  watcherStatusLabel,
  watcherStatusTone,
} from "./types";

describe("toWatcherRow", () => {
  it("flattens the piece onto the waiting row", () => {
    expect(
      toWatcherRow({
        id: 3,
        email: "anjali@example.com",
        product_id: 7,
        product_name: "Slate morning mug",
        product_slug: "slate-morning-mug",
        created_at: "2026-09-10T03:30:00.000Z",
        notified_at: null,
      }),
    ).toEqual({
      id: 3,
      email: "anjali@example.com",
      productId: 7,
      productName: "Slate morning mug",
      productSlug: "slate-morning-mug",
      requestedAt: "2026-09-10T03:30:00.000Z",
      notifiedAt: null,
    });
  });
});

describe("toNotifiedFilter", () => {
  it("reads the two states and drops anything else", () => {
    expect(toNotifiedFilter("1")).toBe(true);
    expect(toNotifiedFilter("0")).toBe(false);
    expect(toNotifiedFilter("maybe")).toBeNull();
    expect(toNotifiedFilter(undefined)).toBeNull();
  });
});

describe("toNotificationsFilter", () => {
  it("carries the search and the notified state", () => {
    expect(toNotificationsFilter({ search: "mug", notified: "0" }, 2)).toEqual({
      page: 2,
      limit: NOTIFICATIONS_PAGE_SIZE,
      search: "mug",
      is_notified: false,
    });
  });

  it("leaves anything unset out of the query", () => {
    expect(toNotificationsFilter({}, 1)).toEqual({
      page: 1,
      limit: NOTIFICATIONS_PAGE_SIZE,
      search: null,
      is_notified: null,
    });
  });
});

describe("toNotificationsExportFilter", () => {
  it("exports exactly what the table is showing", () => {
    expect(
      toNotificationsExportFilter({ search: " mug ", notified: "1" }),
    ).toEqual({ search: "mug", is_notified: true });
  });

  it("exports everything when nothing is filtered", () => {
    expect(toNotificationsExportFilter({})).toEqual({});
  });
});

describe("watcherStatus", () => {
  it("separates waiting from notified", () => {
    expect(watcherStatusLabel(null)).toBe("Waiting");
    expect(watcherStatusLabel("2026-09-15T03:30:00.000Z")).toBe("Notified");
    expect(watcherStatusTone(null)).toBe("warn");
    expect(watcherStatusTone("2026-09-15T03:30:00.000Z")).toBe("quiet");
  });
});

describe("toWatchersCsvName", () => {
  it("dates the sheet in studio time", () => {
    expect(toWatchersCsvName(new Date("2026-09-17T20:00:00.000Z"))).toBe(
      "batch-notifications-2026-09-18.csv",
    );
  });
});
