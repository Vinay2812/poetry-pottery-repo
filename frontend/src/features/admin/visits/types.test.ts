import { describe, expect, it } from "vitest";

import {
  applyVisitPatch,
  canCancelVisit,
  describeWindow,
  toDayEndIso,
  toDayStartIso,
  toVisitRow,
  toVisitState,
  toVisitTableRow,
  toVisitsFilter,
  type VisitRow,
  VISITS_PAGE_SIZE,
  visitStatusLabel,
  visitStatusTone,
} from "./types";

function row(overrides: Partial<VisitRow> = {}): VisitRow {
  return {
    id: "VIS1",
    startsAt: "2026-09-20T06:30:00.000Z",
    endsAt: "2026-09-20T07:00:00.000Z",
    name: "Anjali Rao",
    phone: "9123456789",
    note: null,
    cancelledAt: null,
    customerEmail: null,
    customerId: null,
    ...overrides,
  };
}

describe("toVisitRow", () => {
  it("flattens the visit and the account that booked it", () => {
    expect(
      toVisitRow({
        visit: {
          id: "VIS1",
          starts_at: "2026-09-20T06:30:00.000Z",
          ends_at: "2026-09-20T07:00:00.000Z",
          name: "Anjali Rao",
          phone: "9123456789",
          note: "Coming with a friend.",
          cancelled_at: null,
        },
        customer: { id: 7, email: "anjali@example.com" },
      }),
    ).toMatchObject({
      id: "VIS1",
      note: "Coming with a friend.",
      cancelledAt: null,
      customerEmail: "anjali@example.com",
      customerId: 7,
    });
  });

  it("leaves the customer off a window booked without signing in", () => {
    const result = toVisitRow({
      visit: {
        id: "VIS2",
        starts_at: "2026-09-20T06:30:00.000Z",
        ends_at: "2026-09-20T07:00:00.000Z",
        name: "Dev",
        phone: "9876543210",
        note: null,
        cancelled_at: null,
      },
      customer: null,
    });
    expect(result.customerEmail).toBeNull();
    expect(result.customerId).toBeNull();
  });
});

describe("toDayStartIso and toDayEndIso", () => {
  it("reads a day as a day in the studio", () => {
    expect(toDayStartIso("2026-09-20")).toBe("2026-09-20T00:00:00.000+05:30");
    expect(toDayEndIso("2026-09-20")).toBe("2026-09-20T23:59:59.999+05:30");
  });

  it("ignores anything that is not a day", () => {
    expect(toDayStartIso("soon")).toBeNull();
    expect(toDayEndIso(undefined)).toBeNull();
  });
});

describe("toVisitsFilter", () => {
  it("carries the search, the range and the cancelled toggle", () => {
    expect(
      toVisitsFilter(
        {
          search: "Anjali",
          from: "2026-09-20",
          to: "2026-09-21",
          cancelled: "1",
        },
        2,
      ),
    ).toEqual({
      page: 2,
      limit: VISITS_PAGE_SIZE,
      search: "Anjali",
      from: "2026-09-20T00:00:00.000+05:30",
      to: "2026-09-21T23:59:59.999+05:30",
      include_cancelled: true,
    });
  });

  it("leaves cancelled windows out by default", () => {
    expect(toVisitsFilter({}, 1).include_cancelled).toBeNull();
  });
});

describe("visit state", () => {
  const endsAt = "2026-09-20T07:00:00.000Z";
  const before = new Date("2026-09-20T06:00:00.000Z");
  const after = new Date("2026-09-20T08:00:00.000Z");

  it("separates a visit to come, a past one and a cancelled one", () => {
    expect(toVisitState(null, endsAt, before)).toBe("booked");
    expect(toVisitState(null, endsAt, after)).toBe("past");
    expect(toVisitState("2026-09-18T04:00:00.000Z", endsAt, before)).toBe(
      "cancelled",
    );
  });

  it("labels each state and lets only a visit to come be cancelled", () => {
    expect(visitStatusLabel("booked")).toBe("Booked");
    expect(visitStatusLabel("past")).toBe("Past");
    expect(visitStatusLabel("cancelled")).toBe("Cancelled");
    expect(visitStatusTone("booked")).toBe("live");
    expect(visitStatusTone("past")).toBe("neutral");
    expect(canCancelVisit("booked")).toBe(true);
    expect(canCancelVisit("past")).toBe(false);
    expect(canCancelVisit("cancelled")).toBe(false);
  });
});

describe("describeWindow", () => {
  it("reads half an hour as one range", () => {
    expect(describeWindow("20 Sep, 12:00 pm", "12:30 pm")).toBe(
      "20 Sep, 12:00 pm – 12:30 pm",
    );
  });
});

describe("applyVisitPatch", () => {
  it("stamps only the cancelled row", () => {
    const rows = [row({ id: "a" }), row({ id: "b" })];
    const next = applyVisitPatch(rows, {
      kind: "cancel",
      id: "a",
      at: "2026-09-18T04:00:00.000Z",
    });
    expect(next[0]?.cancelledAt).toBe("2026-09-18T04:00:00.000Z");
    expect(next[1]?.cancelledAt).toBeNull();
  });
});

describe("toVisitTableRow", () => {
  it("reads the state once and hands the table words, a tone and a yes or no", () => {
    const now = new Date("2026-09-20T12:00:00.000Z");
    expect(toVisitTableRow(row(), now)).toMatchObject({
      statusLabel: "Past",
      statusTone: "neutral",
      canCancel: false,
    });
    expect(
      toVisitTableRow(row(), new Date("2026-09-19T00:00:00.000Z")),
    ).toMatchObject({ statusLabel: "Booked", canCancel: true });
  });
});
