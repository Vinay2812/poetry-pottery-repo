import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WorkshopAvailabilityQueryVariables } from "@/graphql/generated/graphql";

import type { WorkshopDayData } from "@/features/workshops/types";

import {
  type SlotPickerWorkshop,
  useSlotPicker,
  type UseSlotPickerOptions,
} from "./useSlotPicker";

interface QueryOptions {
  variables: WorkshopAvailabilityQueryVariables;
  skip: boolean;
}

interface QueryResult {
  data: { workshopAvailability: WorkshopDayData[] } | undefined;
  loading: boolean;
  error?: Error;
  refetch: () => Promise<void>;
}

const { useQueryMock, refetchMock } = vi.hoisted(() => ({
  useQueryMock:
    vi.fn<(document: object, options: QueryOptions) => QueryResult>(),
  refetchMock: vi.fn<() => Promise<void>>(),
}));

vi.mock("@apollo/client/react", () => ({ useQuery: useQueryMock }));

const WORKSHOP: SlotPickerWorkshop = {
  slug: "open-studio",
  timezone: "Asia/Kolkata",
  slot_minutes: 60,
  slot_span_days: 1,
  booking_window_days: 40,
};

// A wall-clock hour in the studio, as the API sends it.
function studioHour(date: string, hour: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(
    Date.UTC(year ?? 2026, (month ?? 1) - 1, day ?? 1, hour) - 330 * 60_000,
  ).toISOString();
}

function dayOn(date: string, hours: number[], remaining = 4): WorkshopDayData {
  return {
    date,
    weekday: 0,
    is_closed: false,
    closed_kind: null,
    reason: null,
    slots: hours.map((hour) => ({
      starts_at: studioHour(date, hour),
      ends_at: studioHour(date, hour + 1),
      remaining,
      is_available: true,
      reason: null,
    })),
  };
}

// A studio time given in fractional hours, so 13.5 is 1:30 pm.
function studioTime(date: string, hours: number): string {
  const top = new Date(studioHour(date, Math.floor(hours))).getTime();
  return new Date(top + (hours % 1) * 3_600_000).toISOString();
}

function halfHourDay(date: string, starts: number[]): WorkshopDayData {
  return {
    date,
    weekday: 0,
    is_closed: false,
    closed_kind: null,
    reason: null,
    slots: starts.map((start) => ({
      starts_at: studioTime(date, start),
      ends_at: studioTime(date, start + 0.5),
      remaining: 4,
      is_available: true,
      reason: null,
    })),
  };
}

// Months keyed by their first day; a missing month is still on the wire.
let months: Record<string, { workshopAvailability: WorkshopDayData[] }> = {};

function renderPicker(options: Partial<UseSlotPickerOptions> = {}) {
  return renderHook((props: UseSlotPickerOptions) => useSlotPicker(props), {
    initialProps: {
      workshop: WORKSHOP,
      hours: 1,
      participants: 1,
      ...options,
    },
  });
}

function lastQuery(): QueryOptions | undefined {
  return useQueryMock.mock.calls.at(-1)?.[1];
}

describe("useSlotPicker", () => {
  beforeEach(() => {
    // 01:30 on 1 October in the studio, still 30 September in UTC.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-30T20:00:00.000Z"));
    months = {
      "2026-10-01": {
        workshopAvailability: [
          dayOn("2026-10-02", [13, 14, 15]),
          dayOn("2026-10-03", [13, 14]),
        ],
      },
      "2026-11-01": {
        workshopAvailability: [dayOn("2026-11-06", [13])],
      },
    };
    refetchMock.mockResolvedValue(undefined);
    useQueryMock.mockReset();
    useQueryMock.mockImplementation((_document, { variables, skip }) => {
      const data = skip ? undefined : months[variables.input.from];
      return { data, loading: !skip && !data, refetch: refetchMock };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens on the studio's month, not the UTC one", () => {
    const { result } = renderPicker();

    expect(result.current.monthLabel).toBe("October 2026");
    expect(lastQuery()?.variables.input).toEqual({
      config_slug: "open-studio",
      from: "2026-10-01",
      days: 31,
      exclude_booking_id: null,
    });
    expect(result.current.canGoBack).toBe(false);
  });

  it("pages only as far as the booking window reaches", () => {
    const { result } = renderPicker();
    expect(result.current.canGoForward).toBe(true);

    act(() => result.current.onNextMonth());
    expect(result.current.monthLabel).toBe("November 2026");
    expect(result.current.canGoForward).toBe(false);

    act(() => result.current.onNextMonth());
    expect(result.current.monthLabel).toBe("November 2026");

    act(() => result.current.onPreviousMonth());
    act(() => result.current.onPreviousMonth());
    expect(result.current.monthLabel).toBe("October 2026");
  });

  it("says a month is loading instead of drawing every day closed", () => {
    delete months["2026-11-01"];
    const { result } = renderPicker();
    expect(result.current.isLoading).toBe(false);

    act(() => result.current.onNextMonth());
    expect(result.current.isLoading).toBe(true);
    expect(lastQuery()?.variables.input.from).toBe("2026-11-01");
  });

  it("fetches nothing while skipped and never reports loading", () => {
    const { result } = renderPicker({ isSkipped: true });

    expect(lastQuery()?.skip).toBe(true);
    expect(result.current.isLoading).toBe(false);
    act(() => result.current.refresh());
    expect(refetchMock).not.toHaveBeenCalled();
  });

  it("reads availability again after a save", () => {
    const { result } = renderPicker();
    act(() => result.current.refresh());
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("suggests the earliest hours until one is changed, and again for a new length", () => {
    const { result, rerender } = renderPicker({ isSuggesting: true });
    expect(result.current.pickedStarts).toEqual([studioHour("2026-10-02", 13)]);
    expect(result.current.isSuggested).toBe(true);
    expect(result.current.selectedDate).toBe("2026-10-02");

    act(() => result.current.onToggleSlot(studioHour("2026-10-02", 15)));
    expect(result.current.pickedStarts).toEqual([studioHour("2026-10-02", 15)]);
    expect(result.current.isSuggested).toBe(false);

    rerender({
      workshop: WORKSHOP,
      hours: 2,
      participants: 1,
      isSuggesting: true,
    });
    expect(result.current.needed).toBe(2);
    expect(result.current.isSuggested).toBe(true);
    expect(result.current.picked.map((slot) => slot.starts_at)).toEqual([
      studioHour("2026-10-02", 13),
      studioHour("2026-10-02", 14),
    ]);
  });

  it("keeps the hours panel on the day an hour was just toggled on", () => {
    const { result } = renderPicker({ hours: 2 });

    act(() => result.current.onToggleSlot(studioHour("2026-10-03", 13)));
    act(() => result.current.onToggleSlot(studioHour("2026-10-02", 13)));
    expect(result.current.selectedDate).toBe("2026-10-02");

    act(() => result.current.onToggleSlot(studioHour("2026-10-02", 13)));
    expect(result.current.selectedDate).toBe("2026-10-02");
  });

  it("drops picked hours a bigger group no longer fits", () => {
    months["2026-10-01"] = {
      workshopAvailability: [
        {
          ...dayOn("2026-10-02", [13]),
          slots: [
            ...dayOn("2026-10-02", [13], 4).slots,
            ...dayOn("2026-10-02", [14], 1).slots,
          ],
        },
      ],
    };
    const { result, rerender } = renderPicker({ hours: 2 });
    act(() => result.current.onSelectDate("2026-10-02"));
    act(() => result.current.onToggleSlot(studioHour("2026-10-02", 13)));
    act(() => result.current.onToggleSlot(studioHour("2026-10-02", 14)));
    expect(result.current.isComplete).toBe(true);

    rerender({ workshop: WORKSHOP, hours: 2, participants: 2 });
    expect(result.current.pickedStarts).toEqual([studioHour("2026-10-02", 13)]);
    expect(result.current.isComplete).toBe(false);
  });

  it("opens a move on the hours held and knows when nothing changed", () => {
    const held = [
      {
        starts_at: studioHour("2026-11-06", 13),
        ends_at: studioHour("2026-11-06", 14),
      },
    ];
    const { result } = renderPicker({ excludeBookingId: "WS-1" });

    act(() => result.current.startFrom(held));
    expect(lastQuery()?.variables.input).toEqual(
      expect.objectContaining({
        from: "2026-11-01",
        exclude_booking_id: "WS-1",
      }),
    );
    expect(result.current.monthLabel).toBe("November 2026");
    expect(result.current.selectedDate).toBe("2026-11-06");
    expect(result.current.isUnchanged).toBe(true);
    expect(result.current.isComplete).toBe(true);

    // An hour the guest unpicks can be picked again, because their own seats count as free.
    act(() => result.current.onRemoveSlot(held[0]!.starts_at));
    expect(result.current.isComplete).toBe(false);
    expect(result.current.slots[0]?.isDisabled).toBe(false);
    act(() => result.current.onToggleSlot(held[0]!.starts_at));
    expect(result.current.isUnchanged).toBe(true);
  });

  it("lays out the month with the picked day marked", () => {
    const { result } = renderPicker({ isSuggesting: true });
    const days = result.current.weeks.flat();
    const picked = days.find((day) => day?.dateKey === "2026-10-02");
    const unsent = days.find((day) => day?.dateKey === "2026-10-05");

    expect(result.current.weeks.every((week) => week.length === 7)).toBe(true);
    expect(picked).toEqual(
      expect.objectContaining({ pickedCount: 1, wheelsFree: 4 }),
    );
    // A day the API did not send is unknown, not closed.
    expect(unsent).toEqual(
      expect.objectContaining({ isLoaded: false, isClosed: false }),
    );
    // A single hour is swapped, not added to, so other days stay open.
    expect(
      days.find((day) => day?.dateKey === "2026-10-03")?.mutedReason,
    ).toBeNull();
    // A single hour has no window to keep to, so no notice.
    expect(result.current.notice).toBeNull();
  });

  it("states the window once more than one time is needed", () => {
    const { result } = renderPicker({ isSuggesting: true, hours: 2 });
    const days = result.current.weeks.flat();

    // Only the same day is open once an hour is picked on a one-day studio.
    expect(days.find((day) => day?.dateKey === "2026-10-03")?.mutedReason).toBe(
      "Pick all your hours on the same day",
    );

    expect(result.current.notice).toBe(
      "Pick all your hours on the same day. Other days are closed off.",
    );
    expect(result.current.progress).toBe("All 2 hours picked");
  });

  it("counts half-hour times as the time they add up to", () => {
    months["2026-10-01"] = {
      workshopAvailability: [halfHourDay("2026-10-02", [13, 13.5])],
    };
    const { result } = renderPicker({
      workshop: { ...WORKSHOP, slot_minutes: 30 },
      isSuggesting: true,
    });

    expect(result.current.needed).toBe(2);
    expect(result.current.progress).toBe("1 hour picked");
    act(() => result.current.onRemoveSlot(result.current.pickedStarts[0]!));
    expect(result.current.progress).toBe("30 minutes of 1 hour picked");
  });

  it("says availability failed instead of calling every day closed", () => {
    useQueryMock.mockImplementation(() => ({
      data: undefined,
      loading: false,
      error: new Error("Network down"),
      refetch: refetchMock,
    }));
    const { result } = renderPicker({ isSuggesting: true });

    expect(result.current.hasError).toBe(true);
    expect(result.current.isLoading).toBe(false);
    // A failed month is not a full one, so the studio is not offered as booked out.
    expect(result.current.hasNoRoom).toBe(false);
    expect(
      result.current.weeks.flat().some((day) => day?.isClosed === true),
    ).toBe(false);
    act(() => result.current.refresh());
    expect(refetchMock).toHaveBeenCalled();
  });
});
