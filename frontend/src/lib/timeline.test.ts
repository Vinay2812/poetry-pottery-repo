import { describe, expect, it } from "vitest";

import { formatDateTime } from "@/lib/format";

import {
  type TimelineStage,
  toClosedLabel,
  toTimelineDate,
  toTimelineSteps,
} from "./timeline";

type Status = "PLACED" | "PACKED" | "SENT" | "CANCELLED";

const STAGES: TimelineStage<Status>[] = [
  { key: "PLACED", label: "Placed", description: "We have it." },
  {
    key: "PACKED",
    label: "Packed",
    description: "Wrapped by hand.",
    upcoming: "Wrapped once paid.",
  },
  {
    key: "SENT",
    label: "Sent",
    description: "On its way.",
    upcoming: "Goes by courier.",
  },
];

const read = (
  status: Status,
  dates: Partial<Record<Status, string | null>>,
  isClosed = false,
) =>
  toTimelineSteps({ stages: STAGES, status, dates, isClosed }).map((step) => [
    step.key,
    step.state,
    step.date,
    step.note,
  ]);

describe("toTimelineSteps", () => {
  it("dates what happened, explains the current stage and promises the rest", () => {
    expect(read("PACKED", { PLACED: "day 1", PACKED: "day 2" })).toEqual([
      ["PLACED", "done", "day 1", null],
      ["PACKED", "current", "day 2", "Wrapped by hand."],
      ["SENT", "upcoming", null, "Goes by courier."],
    ]);
  });

  it("reads a finished item as done and still says what the last stage means", () => {
    expect(
      read("SENT", { PLACED: "day 1", PACKED: "day 2", SENT: "day 3" }),
    ).toEqual([
      ["PLACED", "done", "day 1", null],
      ["PACKED", "done", "day 2", null],
      ["SENT", "done", "day 3", "On its way."],
    ]);
  });

  it("leaves out a stage that was skipped on the way", () => {
    expect(read("SENT", { PLACED: "day 1", SENT: "day 3" })).toEqual([
      ["PLACED", "done", "day 1", null],
      ["SENT", "done", "day 3", "On its way."],
    ]);
  });

  it("leaves out a skipped stage on a closed item too", () => {
    expect(read("CANCELLED", { PLACED: "day 1", SENT: "day 3" }, true)).toEqual(
      [
        ["PLACED", "done", "day 1", null],
        ["SENT", "done", "day 3", null],
      ],
    );
  });

  it("still lists an undated stage the item is on or has ahead of it", () => {
    expect(read("PACKED", { PLACED: "day 1" })).toEqual([
      ["PLACED", "done", "day 1", null],
      ["PACKED", "current", null, "Wrapped by hand."],
      ["SENT", "upcoming", null, "Goes by courier."],
    ]);
  });

  it("shows a closed item only up to its last dated stage", () => {
    expect(
      read("CANCELLED", { PLACED: "day 1", PACKED: "day 2" }, true),
    ).toEqual([
      ["PLACED", "done", "day 1", null],
      ["PACKED", "done", "day 2", null],
    ]);
    expect(read("CANCELLED", { PLACED: "day 1" }, true)).toEqual([
      ["PLACED", "done", "day 1", null],
    ]);
  });
});

describe("toTimelineDate", () => {
  it("formats a timestamp the way the rest of the site does", () => {
    expect(toTimelineDate("2026-09-12T09:30:00.000Z")).toBe(
      formatDateTime("2026-09-12T09:30:00.000Z"),
    );
  });

  it("leaves a stage that has not happened without a date", () => {
    expect(toTimelineDate(null)).toBeNull();
    expect(toTimelineDate(undefined)).toBeNull();
    expect(toTimelineDate("")).toBeNull();
  });
});

describe("toClosedLabel", () => {
  it("says what closed it, when and why", () => {
    expect(toClosedLabel("Cancelled", "16 Sep", "Changed my mind")).toBe(
      "Cancelled on 16 Sep · Changed my mind",
    );
  });

  it("leaves out what it does not know", () => {
    expect(toClosedLabel("Refunded", null, null)).toBe("Refunded");
    expect(toClosedLabel("Cancelled", "16 Sep", "  ")).toBe(
      "Cancelled on 16 Sep",
    );
  });
});
