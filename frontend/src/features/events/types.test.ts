import { describe, expect, it } from "vitest";

import { toUrlSearchParams } from "@/lib/search-params";

import {
  EventLevel,
  EventStatus,
  EventType,
  EventWhen,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import {
  toEventsFilterKey,
  applyRegistrationCancellation,
  DEFAULT_EVENT_FILTERS,
  type RegistrationData,
  isRegistrationClosed,
  parseEventFilters,
  toEventPath,
  toEventSearchParams,
  toEventsFilterInput,
  toEventTypeLabel,
  toLevelLabel,
  toRegistrationPath,
  toRegistrationStatusLabel,
  toRegistrationStatusTone,
  toRegistrationStepIndex,
  toEventWhenLabel,
  toSeatsLabel,
  toSeatsOfTotalLabel,
  toTimeRange,
  toWhatsAppBookingMessage,
} from "./types";

const STARTS_AT = "2026-09-19T09:30:00.000Z";
const ENDS_AT = "2026-09-19T12:30:00.000Z";

describe("paths", () => {
  it("builds event and registration paths", () => {
    expect(toEventPath("wheel-throwing-for-beginners")).toBe(
      "/events/wheel-throwing-for-beginners",
    );
    expect(toRegistrationPath("REG7Q2X9M1KD")).toBe(
      "/registrations/REG7Q2X9M1KD",
    );
  });
});

describe("toSeatsLabel", () => {
  it("counts down to the last seat", () => {
    expect(toSeatsLabel(3, 8)).toBe("3 seats left");
    expect(toSeatsLabel(1, 8)).toBe("Last seat");
    expect(toSeatsLabel(0, 8)).toBe("Sold out");
    expect(toSeatsLabel(8, 8)).toBe("All 8 seats open");
  });

  it("counts seats against the room", () => {
    expect(toSeatsOfTotalLabel(3, 8)).toBe("3 of 8 seats left");
    expect(toSeatsOfTotalLabel(0, 8)).toBe("Sold out");
  });
});

describe("labels", () => {
  it("names levels and event types", () => {
    expect(toLevelLabel(EventLevel.AllLevels)).toBe("All levels");
    expect(toLevelLabel(EventLevel.Beginner)).toBe("Beginner");
    expect(toLevelLabel(null)).toBeNull();
    expect(toEventTypeLabel(EventType.PotteryWorkshop)).toBe(
      "Pottery workshop",
    );
    expect(toEventTypeLabel(EventType.OpenMic)).toBe("Open mic");
  });
});

describe("dates", () => {
  it("writes the start as one plain line", () => {
    expect(toEventWhenLabel(STARTS_AT)).toBe("Sat 19 Sep · 3 pm");
  });

  it("joins start and end into a time range", () => {
    expect(toTimeRange(STARTS_AT, ENDS_AT)).toBe("3:00 pm – 6:00 pm");
  });
});

describe("registration status helpers", () => {
  it("maps statuses to labels, tones and steps", () => {
    expect(toRegistrationStatusLabel(RegistrationStatus.Approved)).toBe(
      "Seat held, awaiting payment",
    );
    expect(toRegistrationStatusTone(RegistrationStatus.Pending)).toBe(
      "pending",
    );
    expect(toRegistrationStatusTone(RegistrationStatus.Approved)).toBe(
      "active",
    );
    expect(toRegistrationStatusTone(RegistrationStatus.Confirmed)).toBe("done");
    expect(toRegistrationStatusTone(RegistrationStatus.Rejected)).toBe("off");
    expect(toRegistrationStepIndex(RegistrationStatus.Confirmed)).toBe(2);
    expect(toRegistrationStepIndex(RegistrationStatus.Cancelled)).toBe(0);
    expect(isRegistrationClosed(RegistrationStatus.Cancelled)).toBe(true);
    expect(isRegistrationClosed(RegistrationStatus.Approved)).toBe(false);
  });

  it("freezes a cancelled booking at the last step it actually reached", () => {
    const dates = { PENDING: "12 Sept", APPROVED: "13 Sept", CONFIRMED: null };
    expect(toRegistrationStepIndex(RegistrationStatus.Cancelled, dates)).toBe(
      1,
    );
    expect(toRegistrationStepIndex(RegistrationStatus.Rejected, dates)).toBe(1);
  });
});

describe("toWhatsAppBookingMessage", () => {
  it("names the workshop, the seats and the booking", () => {
    const message = toWhatsAppBookingMessage({
      registrationId: "REG123",
      eventTitle: "Wheel Throwing for Beginners",
      when: "Sat, 19 Sept, 2026, 3:00 pm",
      seats: 2,
      total: "₹3,600",
      guestName: "Maya",
    });
    expect(message).toContain("Wheel Throwing for Beginners");
    expect(message).toContain("Booking: REG123");
    expect(message).toContain("Seats: 2");
    expect(message).toContain("Total: ₹3,600");
  });
});

describe("event filters", () => {
  it("reads filters from the URL", () => {
    expect(parseEventFilters(new URLSearchParams())).toEqual(
      DEFAULT_EVENT_FILTERS,
    );
    expect(
      parseEventFilters(
        new URLSearchParams("when=past&type=OPEN_MIC&level=BEGINNER"),
      ),
    ).toEqual({
      when: EventWhen.Past,
      eventType: EventType.OpenMic,
      // Level only applies to workshops.
      level: null,
    });
    expect(
      parseEventFilters(
        new URLSearchParams("type=POTTERY_WORKSHOP&level=BEGINNER"),
      ),
    ).toEqual({
      when: EventWhen.Upcoming,
      eventType: EventType.PotteryWorkshop,
      level: EventLevel.Beginner,
    });
    expect(
      parseEventFilters(new URLSearchParams("type=NONSENSE")).eventType,
    ).toBeNull();
  });

  it("writes filters back to the URL", () => {
    expect(toEventSearchParams(DEFAULT_EVENT_FILTERS).toString()).toBe("");
    expect(
      toEventSearchParams({
        when: EventWhen.Past,
        eventType: EventType.OpenMic,
        level: null,
      }).toString(),
    ).toBe("when=past&type=OPEN_MIC");
    expect(
      toEventSearchParams({
        when: EventWhen.Upcoming,
        eventType: EventType.PotteryWorkshop,
        level: EventLevel.Beginner,
      }).toString(),
    ).toBe("type=POTTERY_WORKSHOP&level=BEGINNER");
  });

  it("builds the query input", () => {
    expect(
      toEventsFilterInput(
        {
          when: EventWhen.Upcoming,
          eventType: EventType.PotteryWorkshop,
          level: EventLevel.Beginner,
        },
        2,
      ),
    ).toEqual({
      when: EventWhen.Upcoming,
      event_type: EventType.PotteryWorkshop,
      level: EventLevel.Beginner,
      page: 2,
      limit: 12,
    });
  });
});

function registration(
  overrides: Partial<RegistrationData> = {},
): RegistrationData {
  return {
    id: "reg_1",
    seats: 2,
    unit_price: 1800,
    discount: 0,
    total: 3600,
    status: RegistrationStatus.Approved,
    note: null,
    cancel_reason: null,
    can_cancel: true,
    created_at: "2026-09-10T09:00:00.000Z",
    approved_at: "2026-09-11T09:00:00.000Z",
    confirmed_at: null,
    rejected_at: null,
    cancelled_at: null,
    event: {
      id: 1,
      slug: "glaze-night",
      title: "Glaze night",
      event_type: EventType.PotteryWorkshop,
      status: EventStatus.Published,
      level: EventLevel.AllLevels,
      starts_at: STARTS_AT,
      ends_at: "2026-09-19T11:30:00.000Z",
      location: "The studio",
      price: 1800,
      total_seats: 8,
      available_seats: 4,
      instructor: null,
      image_url: "/events/glaze-night.jpg",
      rating_avg: 0,
      rating_count: 0,
      is_past: false,
      address: "12 Kiln Lane",
    },
    ...overrides,
  };
}

describe("applyRegistrationCancellation", () => {
  it("closes the booking the moment a cancellation is asked for", () => {
    const cancelled = applyRegistrationCancellation(registration(), {
      reason: "  Away that week  ",
      at: "2026-09-12T09:00:00.000Z",
    });
    expect(cancelled?.status).toBe(RegistrationStatus.Cancelled);
    expect(cancelled?.can_cancel).toBe(false);
    expect(cancelled?.cancelled_at).toBe("2026-09-12T09:00:00.000Z");
    expect(cancelled?.cancel_reason).toBe("Away that week");
  });

  it("keeps the reason already on record when none is typed", () => {
    const cancelled = applyRegistrationCancellation(
      registration({ cancel_reason: "Event called off" }),
      { reason: "  ", at: "2026-09-12T09:00:00.000Z" },
    );
    expect(cancelled?.cancel_reason).toBe("Event called off");
  });

  it("leaves the booking it was given alone", () => {
    const current = registration();
    applyRegistrationCancellation(current, {
      reason: "",
      at: "2026-09-12T09:00:00.000Z",
    });
    expect(current.status).toBe(RegistrationStatus.Approved);
  });

  it("has nothing to do before the booking loads", () => {
    expect(
      applyRegistrationCancellation(null, {
        reason: "",
        at: "2026-09-12T09:00:00.000Z",
      }),
    ).toBeNull();
  });
});

describe("toEventsFilterKey", () => {
  it("gives the server's page params and the browser's query string the same key", () => {
    const server = toEventsFilterInput(
      parseEventFilters(toUrlSearchParams({ when: "past" })),
      1,
    );
    const browser = toEventsFilterInput(
      parseEventFilters(new URLSearchParams("when=past")),
      1,
    );
    expect(toEventsFilterKey(server)).toBe(toEventsFilterKey(browser));
  });
});
