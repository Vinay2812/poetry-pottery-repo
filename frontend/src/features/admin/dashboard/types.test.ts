import {
  AdminAgendaKind,
  EventType,
  RegistrationStatus,
} from "@/graphql/generated/graphql";
import { describe, expect, it } from "vitest";

import {
  clampDelta,
  describeBooking,
  describeItems,
  describeStock,
  formatCount,
  stockTone,
  toAgendaHref,
  toAgendaDetail,
  toAgendaKindLabel,
  WAITING_EVENT_REQUESTS_HREF,
  WAITING_SESSIONS_HREF,
} from "./types";

describe("formatCount", () => {
  it("groups the way Indian numbers are read", () => {
    expect(formatCount(1234567)).toBe("12,34,567");
  });
});

describe("describeBooking", () => {
  it("keeps singulars singular", () => {
    expect(describeBooking(1, 1)).toBe("1 hour · 1 person");
    expect(describeBooking(3, 2)).toBe("3 hours · 2 people");
  });
});

describe("describeItems", () => {
  it("counts pieces", () => {
    expect(describeItems(1)).toBe("1 piece");
    expect(describeItems(4)).toBe("4 pieces");
  });
});

describe("describeStock", () => {
  it("says what is left", () => {
    expect(describeStock(0)).toBe("Sold out");
    expect(describeStock(1)).toBe("1 left");
    expect(describeStock(9)).toBe("9 left");
  });
});

describe("stockTone", () => {
  it("marks the last few", () => {
    expect(stockTone(3)).toBe("warn");
    expect(stockTone(4)).toBe("quiet");
  });
});

describe("clampDelta", () => {
  it("never takes stock below zero", () => {
    expect(clampDelta(-5, 2)).toBe(-2);
    expect(clampDelta(-1, 2)).toBe(-1);
    expect(clampDelta(3, 2)).toBe(3);
  });
});

describe("today's agenda", () => {
  it("sends each kind to the page that handles it", () => {
    expect(toAgendaHref(AdminAgendaKind.Booking, "WS-1")).toBe(
      "/dashboard/workshops?config=all&search=WS-1",
    );
    expect(toAgendaHref(AdminAgendaKind.Visit, "SV-1")).toBe(
      "/dashboard/visits",
    );
    expect(toAgendaHref(AdminAgendaKind.Event, "3")).toBe(
      "/dashboard/events/3",
    );
  });

  it("names an event by its type, never by the hour", () => {
    expect(toAgendaKindLabel(AdminAgendaKind.Event, EventType.OpenMic)).toBe(
      "Open mic",
    );
    expect(
      toAgendaKindLabel(AdminAgendaKind.Event, EventType.PotteryWorkshop),
    ).toBe("Workshop");
    expect(toAgendaKindLabel(AdminAgendaKind.Event, null)).toBe("Event");
    expect(toAgendaKindLabel(AdminAgendaKind.Booking, null)).toBe("Wheel");
  });
});

describe("request tiles", () => {
  it("open their lists narrowed to what is waiting on the studio", () => {
    expect(WAITING_SESSIONS_HREF).toBe(
      "/dashboard/workshops?awaiting=1&config=all",
    );
    expect(WAITING_EVENT_REQUESTS_HREF).toBe("/dashboard/events?awaiting=1");
  });
});

describe("toAgendaDetail", () => {
  it("words a wheel session's status the way the guest reads it", () => {
    expect(
      toAgendaDetail(
        "Open studio · 2 at the wheel",
        RegistrationStatus.Pending,
        false,
      ),
    ).toBe("Open studio · 2 at the wheel · Awaiting approval");
  });

  it("drops the payment wording for a free session already approved", () => {
    expect(
      toAgendaDetail(
        "Open studio · 2 at the wheel",
        RegistrationStatus.Approved,
        true,
      ),
    ).toBe("Open studio · 2 at the wheel · Approved");
  });

  it("leaves visits and events as they are", () => {
    expect(toAgendaDetail("Studio visit", null, false)).toBe("Studio visit");
  });
});
