import { describe, expect, it } from "vitest";

import {
  EventLevel,
  EventType,
  EventWhen,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import {
  DEFAULT_EVENT_FILTERS,
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
