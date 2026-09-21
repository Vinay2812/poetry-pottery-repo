import { describe, expect, it } from "vitest";

import { RegistrationStatus } from "@/graphql/generated/graphql";

import {
  addDays,
  applyBookingAction,
  type BookingData,
  daysInMonth,
  formatDayRange,
  formatDateKey,
  formatHourRange,
  formatHours,
  formatMonth,
  formatPickedProgress,
  formatSlotLine,
  formatWheels,
  groupSlotsByDay,
  isBookingClosed,
  isDayWithinSpan,
  isSlotPickable,
  pickableSlots,
  pickTier,
  quoteSession,
  shiftMonth,
  slotsNeeded,
  spanDays,
  spanNotice,
  toPickingGuide,
  toBookingPath,
  toBookingGroup,
  toBookingStatusLabel,
  toBookingStatusTone,
  toBookingStepIndex,
  toBookingWhenLines,
  toDateKey,
  toDayNote,
  isSameSelection,
  togglePicked,
  toMonthGrid,
  toMonthKey,
  toPickedSlots,
  toWhatsAppSessionMessage,
  toWorkshopPath,
  type WorkshopDayData,
} from "./types";

const IST = "Asia/Kolkata";

const tiers = [
  { hours: 1, price_per_person: 950, pieces_per_person: 1 },
  { hours: 2, price_per_person: 1700, pieces_per_person: 2 },
];

function slot(hour: number, remaining: number, available = true) {
  const starts = new Date(Date.UTC(2026, 8, 13, hour - 5, 30));
  const ends = new Date(starts.getTime() + 3_600_000);
  return {
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    remaining,
    is_available: available,
    reason: available ? null : "Fully booked",
  };
}

describe("paths", () => {
  it("builds workshop and booking paths", () => {
    expect(toWorkshopPath("wheel-throwing")).toBe("/workshops/wheel-throwing");
    expect(toBookingPath("BK7Q2X9M1KD3")).toBe(
      "/workshops/bookings/BK7Q2X9M1KD3",
    );
  });
});

describe("calendar helpers", () => {
  it("keys dates in the studio timezone", () => {
    expect(toDateKey("2026-09-12T20:30:00.000Z", "Asia/Kolkata")).toBe(
      "2026-09-13",
    );
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(daysInMonth("2026-02")).toBe(28);
    expect(formatDateKey("2026-09-13")).toBe("Sun, 13 Sept");
  });

  it("walks days and months across their boundaries", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDays("2026-09-13", 0)).toBe("2026-09-13");
    expect(toMonthKey("2026-09-13")).toBe("2026-09");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(daysInMonth("2028-02")).toBe(29);
    expect(formatMonth("2026-09")).toBe("September 2026");
  });

  it("builds a Monday-first grid", () => {
    const grid = toMonthGrid("2026-09");
    expect(grid[0]).toEqual([
      null,
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-05",
      "2026-09-06",
    ]);
    expect(grid.at(-1)?.at(2)).toBe("2026-09-30");
    expect(grid.every((week) => week.length === 7)).toBe(true);
  });
});

describe("session helpers", () => {
  const day: WorkshopDayData = {
    date: "2026-09-13",
    weekday: 0,
    is_closed: false,
    reason: null,
    slots: [slot(13, 6), slot(14, 2), slot(15, 0, false), slot(16, 6)],
  };

  it("prices from the tier", () => {
    expect(pickTier(tiers, 2)?.price_per_person).toBe(1700);
    expect(quoteSession(pickTier(tiers, 2), 3)).toEqual({
      subtotal: 5100,
      pieces: 6,
    });
    expect(quoteSession(null, 3)).toEqual({ subtotal: 0, pieces: 0 });
  });

  it("has no tier for an hour count the studio does not sell", () => {
    expect(pickTier(tiers, 5)).toBeNull();
    expect(pickTier([], 1)).toBeNull();
  });

  it("multiplies whole rupees, from a free seat to a studio buyout", () => {
    expect(
      quoteSession({ hours: 1, price_per_person: 0, pieces_per_person: 1 }, 4),
    ).toEqual({ subtotal: 0, pieces: 4 });
    expect(quoteSession(pickTier(tiers, 1), 0)).toEqual({
      subtotal: 0,
      pieces: 0,
    });
    expect(quoteSession(pickTier(tiers, 1), 1)).toEqual({
      subtotal: 950,
      pieces: 1,
    });
    expect(
      quoteSession(
        { hours: 8, price_per_person: 12_500, pieces_per_person: 6 },
        40,
      ),
    ).toEqual({ subtotal: 500_000, pieces: 240 });
  });

  it("counts the hours a tier needs from the studio's slot length", () => {
    expect(slotsNeeded(2, 30)).toBe(4);
    expect(slotsNeeded(1.5, 60)).toBe(2);
    expect(slotsNeeded(0, 60)).toBe(1);
  });

  it("offers only the hours with room for the whole group", () => {
    expect(slotsNeeded(3, 60)).toBe(3);
    expect(isSlotPickable(day.slots[0]!, 6)).toBe(true);
    expect(isSlotPickable(day.slots[1]!, 3)).toBe(false);
    expect(isSlotPickable(day.slots[2]!, 1)).toBe(false);
    expect(pickableSlots(day, 2).map((s) => s.starts_at)).toEqual([
      day.slots[0]?.starts_at,
      day.slots[1]?.starts_at,
      day.slots[3]?.starts_at,
    ]);
    expect(pickableSlots({ ...day, is_closed: true }, 1)).toEqual([]);
  });

  it("keeps the picked hours inside the allowed span", () => {
    expect(spanDays([])).toBe(0);
    expect(spanDays(["2026-09-13"])).toBe(1);
    expect(spanDays(["2026-09-20", "2026-09-13", "2026-09-15"])).toBe(8);
    expect(isDayWithinSpan("2026-09-19", [], 7)).toBe(true);
    expect(isDayWithinSpan("2026-09-19", ["2026-09-13"], 7)).toBe(true);
    expect(isDayWithinSpan("2026-09-20", ["2026-09-13"], 7)).toBe(false);
    expect(spanNotice(7)).toBe("Pick within 7 days of your first slot");
    expect(spanNotice(1)).toBe("Pick every hour on the same day");
  });

  it("explains the choice before the pickers, matching the span rule", () => {
    expect(toPickingGuide(1, 1)).toBe(
      "Pick a day on the calendar, then 1 hour from the times under it.",
    );
    expect(toPickingGuide(3, 1)).toBe(
      "Pick a day on the calendar, then 3 hours from the times under it; they all sit on that one day.",
    );
    expect(toPickingGuide(3, 30)).toBe(
      "Pick a day on the calendar, then 3 hours from the times under it. They can sit on different days, within 30 days of your first one.",
    );
  });

  it("adds and drops hours up to the tier's count", () => {
    const first = { starts_at: "a", ends_at: "b" };
    const second = { starts_at: "c", ends_at: "d" };
    const third = { starts_at: "e", ends_at: "f" };
    expect(togglePicked([], first, 2)).toEqual([first]);
    expect(togglePicked([first], first, 2)).toEqual([]);
    expect(togglePicked([first, second], third, 2)).toEqual([first, second]);
    expect(formatPickedProgress(2, 3)).toBe("2 of 3 hours picked");
    expect(formatPickedProgress(0, 1)).toBe("0 of 1 hour picked");
  });

  it("knows when a move would land on the hours already held", () => {
    const first = { starts_at: "a", ends_at: "b" };
    const second = { starts_at: "c", ends_at: "d" };
    const other = { starts_at: "e", ends_at: "f" };
    expect(isSameSelection([first], [first])).toBe(true);
    expect(isSameSelection([first, second], [second, first])).toBe(true);
    expect(isSameSelection([first], [other])).toBe(false);
    expect(isSameSelection([first], [first, second])).toBe(false);
    expect(isSameSelection([], [])).toBe(true);
  });

  it("labels hours and groups them by day", () => {
    const slots = [
      { starts_at: day.slots[1]!.starts_at, ends_at: day.slots[1]!.ends_at },
      { starts_at: day.slots[0]!.starts_at, ends_at: day.slots[0]!.ends_at },
      {
        starts_at: "2026-09-15T09:30:00.000Z",
        ends_at: "2026-09-15T10:30:00.000Z",
      },
    ];
    expect(formatHourRange(slots[1]!.starts_at, slots[1]!.ends_at, IST)).toBe(
      "2–3 pm",
    );
    expect(formatSlotLine(slots[1]!, IST)).toBe("Sun, 13 Sept · 2–3 pm");
    expect(groupSlotsByDay(slots, IST)).toEqual([
      {
        dateKey: "2026-09-13",
        dayLabel: "Sun, 13 Sept",
        timesLabel: "2–3 pm, 3–4 pm",
      },
      { dateKey: "2026-09-15", dayLabel: "Tue, 15 Sept", timesLabel: "3–4 pm" },
    ]);
    expect(formatDayRange(slots, IST)).toBe("Sun, 13 Sept – Tue, 15 Sept");
    expect(toBookingWhenLines(slots, IST)).toEqual([
      "Sun, 13 Sept · 2–3 pm, 3–4 pm",
      "Tue, 15 Sept · 3–4 pm",
    ]);
    expect(toBookingWhenLines(slots.slice(0, 2), IST)).toEqual([
      "2–3 pm, 3–4 pm",
    ]);
    expect(formatDayRange(slots.slice(0, 2), IST)).toBe("Sun, 13 Sept");
    expect(toPickedSlots(slots, IST).map((s) => s.startsAt)).toEqual([
      slots[1]?.starts_at,
      slots[0]?.starts_at,
      slots[2]?.starts_at,
    ]);
  });

  it("spells out both meridiems when an hour crosses noon", () => {
    expect(
      formatHourRange(
        "2026-09-13T05:30:00.000Z",
        "2026-09-13T06:30:00.000Z",
        IST,
      ),
    ).toBe("11 am–12 pm");
  });

  it("has no days to name before an hour is picked", () => {
    expect(formatDayRange([], IST)).toBe("");
    expect(groupSlotsByDay([], IST)).toEqual([]);
    expect(toBookingWhenLines([], IST)).toEqual([]);
    expect(toPickedSlots([], IST)).toEqual([]);
  });

  it("writes the WhatsApp message", () => {
    const message = toWhatsAppSessionMessage({
      bookingId: "WS-ABC",
      when: "Sun 13 Sep, 2:00 pm",
      hours: 2,
      participants: 1,
      total: "₹1,700",
      guestName: "Maya",
    });
    expect(message).toContain("Booking: WS-ABC");
    expect(message).toContain("2 hours for 1 person");
  });

  it("says one hour and several people the way a person would", () => {
    expect(
      toWhatsAppSessionMessage({
        bookingId: "WS-DEF",
        when: "Sun 20 Sep, 3:00 pm",
        hours: 1,
        participants: 3,
        total: "₹2,850",
        guestName: "Ravi",
      }),
    ).toContain("1 hour for 3 people");
  });
});

describe("booking status helpers", () => {
  it("maps statuses to labels, tones and steps", () => {
    expect(toBookingStatusLabel(RegistrationStatus.Pending)).toBe(
      "Awaiting confirmation",
    );
    expect(toBookingStatusLabel(RegistrationStatus.Approved)).toBe(
      "Wheel held, awaiting payment",
    );
    expect(toBookingStatusLabel(RegistrationStatus.Confirmed)).toBe(
      "Confirmed",
    );
    expect(toBookingStatusLabel(RegistrationStatus.Rejected)).toBe(
      "Not confirmed",
    );
    expect(toBookingStatusLabel(RegistrationStatus.Cancelled)).toBe(
      "Cancelled",
    );
    expect(toBookingStatusTone(RegistrationStatus.Pending)).toBe("pending");
    expect(toBookingStatusTone(RegistrationStatus.Approved)).toBe("active");
    expect(toBookingStatusTone(RegistrationStatus.Confirmed)).toBe("done");
    expect(toBookingStatusTone(RegistrationStatus.Rejected)).toBe("off");
    expect(toBookingStatusTone(RegistrationStatus.Cancelled)).toBe("off");
    expect(toBookingStepIndex(RegistrationStatus.Pending)).toBe(0);
    expect(toBookingStepIndex(RegistrationStatus.Approved)).toBe(1);
    expect(toBookingStepIndex(RegistrationStatus.Confirmed)).toBe(2);
  });

  it("freezes a closed booking on the first step", () => {
    expect(toBookingStepIndex(RegistrationStatus.Cancelled)).toBe(0);
    expect(toBookingStepIndex(RegistrationStatus.Rejected)).toBe(0);
    expect(isBookingClosed(RegistrationStatus.Cancelled)).toBe(true);
    expect(isBookingClosed(RegistrationStatus.Rejected)).toBe(true);
    expect(isBookingClosed(RegistrationStatus.Approved)).toBe(false);
    expect(isBookingClosed(RegistrationStatus.Confirmed)).toBe(false);
  });

  it("counts hours and free wheels", () => {
    expect(formatHours(1)).toBe("1 hour");
    expect(formatHours(3)).toBe("3 hours");
    expect(formatWheels(1)).toBe("1 wheel free");
    expect(formatWheels(0)).toBe("0 wheels free");
    expect(formatWheels(4)).toBe("4 wheels free");
  });
});

function booking(overrides: Partial<BookingData> = {}): BookingData {
  return {
    id: "bk_1",
    starts_at: "2026-09-20T09:00:00.000Z",
    ends_at: "2026-09-20T11:00:00.000Z",
    slots: [
      {
        starts_at: "2026-09-20T09:00:00.000Z",
        ends_at: "2026-09-20T10:00:00.000Z",
      },
      {
        starts_at: "2026-09-20T10:00:00.000Z",
        ends_at: "2026-09-20T11:00:00.000Z",
      },
    ],
    hours: 2,
    participants: 1,
    price_per_person: 2400,
    pieces_per_person: 2,
    subtotal: 2400,
    discount: 0,
    total: 2400,
    status: RegistrationStatus.Approved,
    note: null,
    cancel_reason: null,
    can_cancel: true,
    can_reschedule: true,
    created_at: "2026-09-10T09:00:00.000Z",
    approved_at: "2026-09-11T09:00:00.000Z",
    confirmed_at: null,
    rejected_at: null,
    cancelled_at: null,
    config: {
      id: 1,
      slug: "wheel-throwing",
      name: "Wheel throwing",
      description: null,
      image_url: null,
      timezone: "Asia/Kolkata",
      opening_minutes: 600,
      closing_minutes: 1200,
      slot_minutes: 60,
      capacity_per_slot: 4,
      booking_window_days: 30,
      slot_span_days: 1,
      closed_weekdays: [],
      tiers: [],
    },
    ...overrides,
  };
}

describe("applyBookingAction", () => {
  it("closes the booking the moment a cancellation is asked for", () => {
    const cancelled = applyBookingAction(booking(), {
      kind: "cancel",
      reason: "  Cannot make it  ",
      at: "2026-09-12T09:00:00.000Z",
    });
    expect(cancelled?.status).toBe(RegistrationStatus.Cancelled);
    expect(cancelled?.can_cancel).toBe(false);
    expect(cancelled?.can_reschedule).toBe(false);
    expect(cancelled?.cancelled_at).toBe("2026-09-12T09:00:00.000Z");
    expect(cancelled?.cancel_reason).toBe("Cannot make it");
  });

  it("keeps the reason already on record when none is typed", () => {
    const cancelled = applyBookingAction(
      booking({ cancel_reason: "Studio closed" }),
      { kind: "cancel", reason: "   ", at: "2026-09-12T09:00:00.000Z" },
    );
    expect(cancelled?.cancel_reason).toBe("Studio closed");
  });

  it("moves the hours and restates when the session runs", () => {
    const moved = applyBookingAction(booking(), {
      kind: "reschedule",
      slots: [
        {
          starts_at: "2026-09-25T12:00:00.000Z",
          ends_at: "2026-09-25T13:00:00.000Z",
        },
        {
          starts_at: "2026-09-25T11:00:00.000Z",
          ends_at: "2026-09-25T12:00:00.000Z",
        },
      ],
    });
    expect(moved?.starts_at).toBe("2026-09-25T11:00:00.000Z");
    expect(moved?.ends_at).toBe("2026-09-25T13:00:00.000Z");
    expect(moved?.slots.map((slot) => slot.starts_at)).toEqual([
      "2026-09-25T11:00:00.000Z",
      "2026-09-25T12:00:00.000Z",
    ]);
  });

  it("leaves the booking alone when a move picks no hours", () => {
    const current = booking();
    expect(applyBookingAction(current, { kind: "reschedule", slots: [] })).toBe(
      current,
    );
  });

  it("has nothing to do before the booking loads", () => {
    expect(
      applyBookingAction(null, {
        kind: "cancel",
        reason: "",
        at: "2026-09-12T09:00:00.000Z",
      }),
    ).toBeNull();
  });
});

describe("toDayNote", () => {
  const day = {
    wheelsFree: 6,
    pickedCount: 0,
    isClosed: false,
    isPast: false,
    mutedReason: null as string | null,
  };

  it("counts the wheels a bookable day still has", () => {
    expect(toDayNote(day)).toEqual({
      caption: "6 wheels free",
      description: "6 wheels free",
      isPickable: true,
    });
    expect(toDayNote({ ...day, pickedCount: 2 }).description).toBe(
      "6 wheels free, 2 picked",
    );
  });

  it("tells a past day apart from a closed one", () => {
    expect(toDayNote({ ...day, isPast: true, isClosed: true })).toEqual({
      caption: "past",
      description: "past",
      isPickable: false,
    });
    expect(toDayNote({ ...day, isClosed: true }).description).toBe(
      "studio closed",
    );
  });

  it("names the span and the empty day as their own reasons", () => {
    expect(toDayNote({ ...day, wheelsFree: 0 }).caption).toBe("full");
    expect(
      toDayNote({
        ...day,
        mutedReason: "Pick within 7 days of your first slot",
      }),
    ).toEqual({
      caption: "too far",
      description: "pick within 7 days of your first slot",
      isPickable: false,
    });
  });
});

describe("toBookingGroup", () => {
  const now = new Date("2026-09-17T12:00:00Z");
  const slots = [
    { starts_at: "2026-09-20T09:00:00Z", ends_at: "2026-09-20T10:00:00Z" },
  ];

  it("keeps a session still to run in front", () => {
    expect(toBookingGroup(slots, RegistrationStatus.Confirmed, now)).toBe(
      "upcoming",
    );
  });

  it("files a finished session behind", () => {
    expect(
      toBookingGroup(
        [
          {
            starts_at: "2026-09-01T09:00:00Z",
            ends_at: "2026-09-01T10:00:00Z",
          },
        ],
        RegistrationStatus.Confirmed,
        now,
      ),
    ).toBe("past");
  });

  it("files a cancelled session behind however far off it was", () => {
    expect(toBookingGroup(slots, RegistrationStatus.Cancelled, now)).toBe(
      "past",
    );
    expect(toBookingGroup([], RegistrationStatus.Pending, now)).toBe("past");
  });
});
