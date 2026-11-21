import { describe, expect, it } from "vitest";

import {
  type TimelineStage,
  toClosedLabel,
  toRepeatedPhrases,
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
  dates: Record<string, string | null>,
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

  it("leaves a reached stage nobody dated as its label alone", () => {
    expect(read("SENT", { PLACED: "day 1", SENT: "day 3" })).toEqual([
      ["PLACED", "done", "day 1", null],
      ["PACKED", "done", null, null],
      ["SENT", "current", "day 3", "On its way."],
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

describe("toClosedLabel", () => {
  it("says what closed it, when and why", () => {
    expect(toClosedLabel("Cancelled", "16 Sept", "Changed my mind")).toBe(
      "Cancelled on 16 Sept · Changed my mind",
    );
  });

  it("leaves out what it does not know", () => {
    expect(toClosedLabel("Refunded", null, null)).toBe("Refunded");
    expect(toClosedLabel("Cancelled", "16 Sept", "  ")).toBe(
      "Cancelled on 16 Sept",
    );
  });
});

describe("toRepeatedPhrases", () => {
  it("finds a promise that repeats the description above it", () => {
    expect(
      toRepeatedPhrases([
        {
          key: "A",
          label: "A",
          description: "We will confirm it on WhatsApp.",
        },
        {
          key: "B",
          label: "B",
          description: "Confirmed.",
          upcoming: "We confirm it on WhatsApp soon.",
        },
      ]),
    ).toEqual(["confirm it on", "it on whatsapp"]);
  });

  it("passes promises that add something new", () => {
    expect(toRepeatedPhrases(STAGES)).toEqual([]);
  });
});
