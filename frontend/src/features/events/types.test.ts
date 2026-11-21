import { describe, expect, it } from "vitest";

import { toUrlSearchParams } from "@/lib/search-params";

import {
  EventLevel,
  EventStatus,
  EventType,
  EventWhen,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import { toRepeatedPhrases } from "@/lib/testing/timeline";
import { toTimelineSteps } from "@/lib/timeline";

import {
  toEventsFilterKey,
  applyRegistrationCancellation,
  DEFAULT_EVENT_FILTERS,
  type RegistrationData,
  parseEventFilters,
  toEventPath,
  toEventSearchParams,
  toEventsFilterInput,
  toEventTypeLabel,
  toLevelLabel,
  toRegistrationPath,
  REGISTRATION_STAGES,
  toEventWhenLabel,
  toEventWhenRangeLabel,
  toEventFacts,
  toGalleryHeading,
  hasEventStarted,
  toParagraphs,
  toRegistrationClosedLabel,
  toRegistrationFacts,
  toRegistrationGroups,
  isRequestBannerShown,
  isSeatPriceShown,
  toEventCardSeatsLabel,
  toStartDelayMs,
  toRegistrationStepDates,
  toRequestSeatsLabel,
  toReserveNotePlaceholder,
  toReserveState,
  toSeatPriceNote,
  toSeatsLabel,
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

const NOW = new Date("2026-09-01T00:00:00.000Z");

describe("dates", () => {
  it("writes the start as one plain line", () => {
    expect(toEventWhenLabel(STARTS_AT, NOW)).toBe("Sat 19 Sep · 3 pm");
  });

  it("names the year only when it is not this one", () => {
    expect(toEventWhenLabel("2025-10-18T13:00:00.000Z", NOW)).toBe(
      "Sat 18 Oct 2025 · 6:30 pm",
    );
  });

  it("closes the line with the end hour", () => {
    expect(toEventWhenRangeLabel(STARTS_AT, ENDS_AT, NOW)).toBe(
      "Sat 19 Sep · 3 pm – 6 pm",
    );
  });

  it("joins start and end into a time range", () => {
    expect(toTimeRange(STARTS_AT, ENDS_AT)).toBe("3:00 pm – 6:00 pm");
  });
});

describe("registration status helpers", () => {
  it("keys every stage by a registration status", () => {
    expect(REGISTRATION_STAGES.map((stage) => stage.key)).toEqual([
      RegistrationStatus.Pending,
      RegistrationStatus.Approved,
      RegistrationStatus.Confirmed,
    ]);
  });

  const readTimeline = (
    status: RegistrationStatus,
    dates: Partial<Record<RegistrationStatus, string | null>>,
    isClosed = false,
  ) =>
    toTimelineSteps({
      stages: REGISTRATION_STAGES,
      status,
      dates,
      isClosed,
    }).map((step) => [step.label, step.state, step.date, step.note]);

  it("promises approval and payment while a request waits", () => {
    expect(
      readTimeline(RegistrationStatus.Pending, { PENDING: "12 Sept" }),
    ).toEqual([
      [
        "Requested",
        "current",
        "12 Sept",
        "We have your request and are holding your seat.",
      ],
      [
        "Approved",
        "upcoming",
        null,
        "We look over each request, then approve it and share payment details on WhatsApp.",
      ],
      [
        "Confirmed",
        "upcoming",
        null,
        "Confirmed as soon as your payment lands.",
      ],
    ]);
  });

  it("asks for payment once approved", () => {
    expect(
      readTimeline(RegistrationStatus.Approved, {
        PENDING: "12 Sept",
        APPROVED: "13 Sept",
      }),
    ).toEqual([
      ["Requested", "done", "12 Sept", null],
      ["Approved", "current", "13 Sept", "Payment details are on WhatsApp."],
      [
        "Confirmed",
        "upcoming",
        null,
        "Confirmed as soon as your payment lands.",
      ],
    ]);
  });

  it("gives the arrival instructions once confirmed, as a finished step", () => {
    expect(
      readTimeline(RegistrationStatus.Confirmed, {
        PENDING: "12 Sept",
        APPROVED: "13 Sept",
        CONFIRMED: "14 Sept",
      }).at(-1),
    ).toEqual([
      "Confirmed",
      "done",
      "14 Sept",
      "Paid and confirmed. Come in ten minutes early.",
    ]);
  });

  it("stops a closed registration at the stage it reached", () => {
    const dates = { PENDING: "12 Sept", APPROVED: "13 Sept", CONFIRMED: null };
    for (const status of [
      RegistrationStatus.Cancelled,
      RegistrationStatus.Rejected,
    ]) {
      expect(readTimeline(status, dates, true)).toEqual([
        ["Requested", "done", "12 Sept", null],
        ["Approved", "done", "13 Sept", null],
      ]);
    }
  });

  it("never repeats the line above it in a promise", () => {
    expect(toRepeatedPhrases(REGISTRATION_STAGES)).toEqual([]);
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

describe("event detail helpers", () => {
  it("keeps at most three paragraphs and drops blank lines", () => {
    expect(toParagraphs("One.\n\n Two. \nThree.\nFour.")).toEqual([
      "One.",
      "Two.",
      "Three.",
    ]);
  });

  it("lists only the facts an event has, never price or seats", () => {
    const facts = toEventFacts({
      location: "The studio",
      address: "Sangli",
      level: null,
      instructor: null,
      performers: ["Asha", "Kiran"],
    });
    // The date and time sit under the title, so they are not repeated here.
    expect(facts.map((fact) => fact.label)).toEqual(["Where", "Line-up"]);
    expect(facts[0]?.value).toBe("The studio, Sangli");
    expect(facts[1]?.value).toBe("Asha, Kiran");
  });

  it("picks one reserve state, cancelled first", () => {
    const open = {
      isCancelled: false,
      hasBooking: false,
      isPast: false,
      hasStarted: false,
      availableSeats: 3,
    };
    expect(toReserveState(open)).toBe("open");
    expect(toReserveState({ ...open, hasStarted: true })).toBe("started");
    expect(
      toReserveState({ ...open, hasStarted: true, availableSeats: 0 }),
    ).toBe("started");
    expect(
      toReserveState({ ...open, hasStarted: true, hasBooking: true }),
    ).toBe("booked");
    expect(toReserveState({ ...open, availableSeats: 0 })).toBe("soldOut");
    expect(toReserveState({ ...open, isPast: true, availableSeats: 0 })).toBe(
      "past",
    );
    expect(toReserveState({ ...open, isPast: true, hasBooking: true })).toBe(
      "booked",
    );
    expect(
      toReserveState({ ...open, hasBooking: true, isCancelled: true }),
    ).toBe("cancelled");
  });

  it("closes registration from the start time, as the API does", () => {
    expect(
      hasEventStarted(STARTS_AT, new Date("2026-09-19T09:29:59.000Z")),
    ).toBe(false);
    expect(hasEventStarted(STARTS_AT, new Date(STARTS_AT))).toBe(true);
    expect(
      hasEventStarted(STARTS_AT, new Date("2026-09-19T11:00:00.000Z")),
    ).toBe(true);
  });

  it("asks for seats rather than selling them", () => {
    expect(toRequestSeatsLabel(1)).toBe("Request a seat");
    expect(toRequestSeatsLabel(3)).toBe("Request 3 seats");
  });

  it("words the box and gallery for the kind of evening", () => {
    expect(toSeatPriceNote(EventType.PotteryWorkshop, [])).toContain("Clay");
    expect(toSeatPriceNote(EventType.OpenMic, [])).toBeNull();
    // The editor's includes list stands in for the stock line, so the two never disagree.
    expect(
      toSeatPriceNote(EventType.PotteryWorkshop, ["Clay and tools"]),
    ).toBeNull();
    expect(toReserveNotePlaceholder(EventType.OpenMic)).not.toContain("wheel");
    expect(toGalleryHeading(EventType.PotteryWorkshop)).toBe(
      "From the workshop",
    );
    expect(toGalleryHeading(EventType.OpenMic)).toBe("From the evening");
  });
});

describe("registration detail helpers", () => {
  it("dates only the steps the booking reached", () => {
    const dates = toRegistrationStepDates(registration());
    expect(dates[RegistrationStatus.Pending]).toBeTruthy();
    expect(dates[RegistrationStatus.Approved]).toBeTruthy();
    expect(dates[RegistrationStatus.Confirmed]).toBeNull();
  });

  it("says when and why a booking closed", () => {
    expect(toRegistrationClosedLabel(registration())).toBeNull();
    const label = toRegistrationClosedLabel(
      registration({
        status: RegistrationStatus.Cancelled,
        cancelled_at: "2026-09-12T09:00:00.000Z",
        cancel_reason: "Away that week",
      }),
    );
    expect(label).toMatch(/^Cancelled on .+ · Away that week$/);
    expect(
      toRegistrationClosedLabel(
        registration({ status: RegistrationStatus.Rejected }),
      ),
    ).toBe("Not approved");
  });

  it("lists the event facts for a booking", () => {
    expect(
      toRegistrationFacts(registration().event).map((fact) => fact.label),
    ).toEqual(["Kind", "Date", "Time", "Where"]);
  });

  it("files closed and finished bookings under past and leaves out empty groups", () => {
    const groups = toRegistrationGroups(
      [
        registration({ id: "open" }),
        registration({ id: "cancelled", status: RegistrationStatus.Cancelled }),
        registration({
          id: "done",
          event: { ...registration().event, is_past: true },
        }),
      ],
      NOW,
    );
    expect(groups.map((group) => group.key)).toEqual(["upcoming", "past"]);
    expect(groups[0]?.registrations.map((item) => item.id)).toEqual(["open"]);
    expect(groups[1]?.registrations.map((item) => item.id).sort()).toEqual([
      "cancelled",
      "done",
    ]);
    expect(
      toRegistrationGroups([registration()], NOW).map((g) => g.key),
    ).toEqual(["upcoming"]);
  });

  it("files a booking for a date that has begun but not ended under way", () => {
    const duringTheEvent = new Date("2026-09-19T10:00:00.000Z");
    const groups = toRegistrationGroups(
      [
        registration({ id: "now" }),
        registration({
          id: "later",
          event: {
            ...registration().event,
            starts_at: "2026-10-04T09:30:00.000Z",
          },
        }),
      ],
      duringTheEvent,
    );
    expect(groups.map((group) => group.key)).toEqual(["underWay", "upcoming"]);
    expect(groups[0]?.heading).toBe("Under way");
    expect(groups[0]?.registrations.map((item) => item.id)).toEqual(["now"]);
    // Once the API calls it past, it leaves the under-way group.
    expect(
      toRegistrationGroups(
        [registration({ event: { ...registration().event, is_past: true } })],
        duringTheEvent,
      ).map((group) => group.key),
    ).toEqual(["past"]);
  });

  it("puts the soonest upcoming date first and the latest past date first", () => {
    const on = (id: string, startsAt: string, isPast: boolean) =>
      registration({
        id,
        event: {
          ...registration().event,
          starts_at: startsAt,
          is_past: isPast,
        },
      });
    // The API lists newest bookings first, which is not the order of the dates.
    const groups = toRegistrationGroups(
      [
        on("dec", "2026-12-20T09:30:00.000Z", false),
        on("oct", "2026-10-04T09:30:00.000Z", false),
        on("aug", "2026-08-01T09:30:00.000Z", true),
        on("sep", "2026-09-01T09:30:00.000Z", true),
      ],
      NOW,
    );
    expect(groups[0]?.registrations.map((item) => item.id)).toEqual([
      "oct",
      "dec",
    ]);
    expect(groups[1]?.registrations.map((item) => item.id)).toEqual([
      "sep",
      "aug",
    ]);
  });

  it("shows the request receipt only while the studio has not answered", () => {
    expect(isRequestBannerShown(true, RegistrationStatus.Pending)).toBe(true);
    // A reopened ?placed=1 link after approval must not ask to confirm again.
    expect(isRequestBannerShown(true, RegistrationStatus.Approved)).toBe(false);
    expect(isRequestBannerShown(true, RegistrationStatus.Confirmed)).toBe(
      false,
    );
    expect(isRequestBannerShown(true, RegistrationStatus.Cancelled)).toBe(
      false,
    );
    expect(isRequestBannerShown(false, RegistrationStatus.Pending)).toBe(false);
  });
});

describe("start-time helpers", () => {
  const BEFORE = new Date("2026-09-19T09:00:00.000Z");
  const AFTER = new Date("2026-09-19T10:00:00.000Z");

  it("waits until the start, never less than zero and never past the timer limit", () => {
    expect(toStartDelayMs(STARTS_AT, BEFORE)).toBe(30 * 60 * 1000);
    expect(toStartDelayMs(STARTS_AT, AFTER)).toBe(0);
    expect(toStartDelayMs("2027-06-01T00:00:00.000Z", BEFORE)).toBe(
      2_147_483_647,
    );
  });

  it("labels a card by the same start-time rule", () => {
    const card = {
      is_past: false,
      starts_at: STARTS_AT,
      available_seats: 12,
      total_seats: 20,
    };
    expect(toEventCardSeatsLabel(card, BEFORE)).toBe("12 seats left");
    expect(toEventCardSeatsLabel(card, new Date(STARTS_AT))).toBe("Under way");
    expect(toEventCardSeatsLabel({ ...card, is_past: true }, BEFORE)).toBe(
      "Wrapped up",
    );
  });

  it("shows a seat price only while a seat is still ahead", () => {
    const ahead = { isPast: false, hasStarted: false, bookingStatus: null };
    expect(isSeatPriceShown({ ...ahead, state: "open" })).toBe(true);
    expect(isSeatPriceShown({ ...ahead, state: "soldOut" })).toBe(true);
    const booked = {
      ...ahead,
      state: "booked" as const,
      bookingStatus: RegistrationStatus.Pending,
    };
    expect(isSeatPriceShown(booked)).toBe(true);
    expect(
      isSeatPriceShown({
        ...booked,
        bookingStatus: RegistrationStatus.Approved,
      }),
    ).toBe(true);
    // Paid is paid: a confirmed seat has nothing left to price.
    expect(
      isSeatPriceShown({
        ...booked,
        bookingStatus: RegistrationStatus.Confirmed,
      }),
    ).toBe(false);
    expect(
      isSeatPriceShown({ ...booked, isPast: true, hasStarted: true }),
    ).toBe(false);
    expect(isSeatPriceShown({ ...booked, hasStarted: true })).toBe(false);
    expect(isSeatPriceShown({ ...ahead, state: "started" })).toBe(false);
    expect(isSeatPriceShown({ ...ahead, state: "past" })).toBe(false);
  });
});
