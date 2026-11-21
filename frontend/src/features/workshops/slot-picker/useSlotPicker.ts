"use client";

import { useCallback, useMemo, useState } from "react";

import { useQuery } from "@apollo/client/react";
import { WorkshopAvailabilityDocument } from "@/graphql/generated/graphql";

import type { CalendarDay } from "@/features/workshops/components/BookingCalendar";
import type { PickedSlot } from "@/features/workshops/components/PickedSlots";
import type { SlotOption } from "@/features/workshops/components/SlotList";
import {
  formatPickedProgress,
  type SlotInterval,
  slotsNeeded,
  toDateKey,
  toSpanRule,
  type WorkshopData,
  type WorkshopDayData,
} from "@/features/workshops/types";

import {
  addDays,
  daysInMonth,
  formatMonth,
  isSameSelection,
  isSlotPickable,
  shiftMonth,
  suggestSlots,
  toCalendarWeeks,
  togglePicked,
  toMonthKey,
  toPickedSlots,
  toSlotOptions,
  toVisibleWeeks,
} from "./grid";

export type SlotPickerWorkshop = Pick<
  WorkshopData,
  | "slug"
  | "timezone"
  | "slot_minutes"
  | "slot_span_days"
  | "booking_window_days"
>;

export interface UseSlotPickerOptions {
  // Null while the workshop is still loading; nothing is fetched until it arrives.
  workshop: SlotPickerWorkshop | null;
  hours: number;
  participants: number;
  // A booking being moved, whose own hours count as free for its owner.
  excludeBookingId?: string;
  // Picks the earliest free hours of the opening month until someone changes one.
  isSuggesting?: boolean;
  isSkipped?: boolean;
}

export interface SlotPicker {
  monthLabel: string;
  weeks: (CalendarDay | null)[][];
  selectedDate: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  // The month's availability failed to load; nothing about its days is known.
  hasError: boolean;
  notice: string | null;
  slots: SlotOption[];
  // The hours to send, in the order they happen.
  picked: SlotInterval[];
  pickedSlots: PickedSlot[];
  pickedStarts: string[];
  // How many times of day the hours take, which depends on the slot length.
  needed: number;
  // Time picked against the hours booked, as "2 of 3 hours picked".
  progress: string;
  isComplete: boolean;
  isSuggested: boolean;
  hasNoRoom: boolean;
  isUnchanged: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
  onToggleSlot: (startsAt: string) => void;
  onRemoveSlot: (startsAt: string) => void;
  // Opens the picker on hours already held, on the month and day of the first of them.
  startFrom: (selection: readonly SlotInterval[]) => void;
  refresh: () => void;
}

const NO_DAYS: WorkshopDayData[] = [];
const NO_SLOTS: SlotInterval[] = [];

export function useSlotPicker({
  workshop,
  hours,
  participants,
  excludeBookingId,
  isSuggesting = false,
  isSkipped = false,
}: UseSlotPickerOptions): SlotPicker {
  const timezone = workshop?.timezone ?? "Asia/Kolkata";
  const spanAllowance = workshop?.slot_span_days ?? 1;
  const slotMinutes = workshop?.slot_minutes ?? 60;
  const needed = slotsNeeded(hours, slotMinutes);
  // The studio's calendar, never the visitor's or UTC's, decides which month opens.
  const todayKey = toDateKey(new Date(), timezone);
  const firstMonth = toMonthKey(todayKey);
  const lastMonth = toMonthKey(
    addDays(todayKey, workshop?.booking_window_days ?? 0),
  );

  const [month, setMonth] = useState(firstMonth);
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const [manual, setManual] = useState<SlotInterval[] | null>(null);
  const [baseline, setBaseline] = useState<readonly SlotInterval[]>(NO_SLOTS);

  const isIdle = isSkipped || !workshop;
  const { data, loading, error, refetch } = useQuery(
    WorkshopAvailabilityDocument,
    {
      variables: {
        input: {
          config_slug: workshop?.slug ?? "",
          from: `${month}-01`,
          days: daysInMonth(month),
          exclude_booking_id: excludeBookingId ?? null,
        },
      },
      skip: isIdle,
      // Wheels are taken by other guests all day, so a revisited month is read again.
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    },
  );
  // Only this month's days count; another month's would mark every day here closed.
  const days = data?.workshopAvailability ?? NO_DAYS;
  const isLoading = !isIdle && loading && !data;
  const hasError = !isIdle && Boolean(error) && !data;

  const dayByKey = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );
  const slotByStart = useMemo(
    () =>
      new Map(
        days.flatMap((day) => day.slots).map((slot) => [slot.starts_at, slot]),
      ),
    [days],
  );

  // A new length starts over; a bigger group drops the hours it has outgrown.
  const [pickedFor, setPickedFor] = useState({ needed, participants });
  if (pickedFor.needed !== needed || pickedFor.participants !== participants) {
    setPickedFor({ needed, participants });
    setManual((previous) =>
      !previous || pickedFor.needed !== needed
        ? null
        : previous.filter((picked) => {
            const slot = slotByStart.get(picked.starts_at);
            return !slot || isSlotPickable(slot, participants);
          }),
    );
  }

  // Only the opening month is picked ahead, so browsing forward never moves a pick nobody made.
  const suggestion = useMemo(
    () =>
      !isSuggesting || isIdle || isLoading || hasError || month !== firstMonth
        ? undefined
        : suggestSlots(days, needed, participants, spanAllowance, todayKey),
    [
      days,
      firstMonth,
      hasError,
      isIdle,
      isLoading,
      isSuggesting,
      month,
      needed,
      participants,
      spanAllowance,
      todayKey,
    ],
  );
  const isTouched = manual !== null;
  const picked = manual ?? suggestion ?? NO_SLOTS;

  const firstPicked = picked[0];
  const selectedDate =
    chosenDate ??
    (firstPicked ? toDateKey(firstPicked.starts_at, timezone) : null);

  const pickedDateKeys = useMemo(
    () => picked.map((slot) => toDateKey(slot.starts_at, timezone)),
    [picked, timezone],
  );
  const weeks = useMemo(
    () =>
      toVisibleWeeks(
        toCalendarWeeks({
          monthKey: month,
          dayByKey,
          participants,
          pickedDateKeys,
          allowedSpanDays: spanAllowance,
          todayKey,
        }),
      ),
    [dayByKey, month, participants, pickedDateKeys, spanAllowance, todayKey],
  );
  const selectedDay = selectedDate ? dayByKey.get(selectedDate) : undefined;
  const slots = useMemo(
    () => toSlotOptions(selectedDay, participants, timezone),
    [participants, selectedDay, timezone],
  );
  const pickedSlots = useMemo(
    () => toPickedSlots(picked, timezone),
    [picked, timezone],
  );
  const pickedStarts = useMemo(
    () => picked.map((slot) => slot.starts_at),
    [picked],
  );
  const pickedInOrder = useMemo(
    () => [...picked].sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    [picked],
  );

  const handlePreviousMonth = useCallback(() => {
    setMonth((current) =>
      current > firstMonth ? shiftMonth(current, -1) : current,
    );
  }, [firstMonth]);

  // The booking window is the last month worth showing; past it every day is closed.
  const handleNextMonth = useCallback(() => {
    setMonth((current) =>
      current < lastMonth ? shiftMonth(current, 1) : current,
    );
  }, [lastMonth]);

  const handleToggleSlot = useCallback(
    (startsAt: string) => {
      const slot = slotByStart.get(startsAt);
      if (!slot) return;
      // The panel stays on the day being worked on, even once its last hour is unpicked.
      setChosenDate(toDateKey(startsAt, timezone));
      setManual(togglePicked(picked, slot, needed));
    },
    [needed, picked, slotByStart, timezone],
  );

  const handleRemoveSlot = useCallback(
    (startsAt: string) => {
      setManual(picked.filter((slot) => slot.starts_at !== startsAt));
    },
    [picked],
  );

  const startFrom = useCallback(
    (selection: readonly SlotInterval[]) => {
      const slots = selection.map((slot) => ({
        starts_at: slot.starts_at,
        ends_at: slot.ends_at,
      }));
      const first = [...slots].sort((a, b) =>
        a.starts_at.localeCompare(b.starts_at),
      )[0];
      // The day stays open even if every hour on it is unpicked, so it can be picked again.
      const dateKey = first ? toDateKey(first.starts_at, timezone) : null;
      setManual(slots);
      setBaseline(slots);
      setChosenDate(dateKey);
      setMonth(dateKey ? toMonthKey(dateKey) : firstMonth);
    },
    [firstMonth, timezone],
  );

  const refresh = useCallback(() => {
    // A skipped query reads again when it comes back, because of cache-and-network.
    if (!isIdle) void refetch();
  }, [isIdle, refetch]);

  return {
    monthLabel: formatMonth(month),
    weeks,
    selectedDate,
    canGoBack: month > firstMonth,
    canGoForward: month < lastMonth,
    isLoading,
    hasError,
    // A single time has no window to keep to, so the rule only shows once it can bite.
    notice:
      needed > 1 && picked.length > 0
        ? `${toSpanRule(spanAllowance)}. Days further out are closed off.`
        : null,
    slots,
    picked: pickedInOrder,
    pickedSlots,
    pickedStarts,
    needed,
    progress: formatPickedProgress(picked.length * slotMinutes, hours),
    isComplete: picked.length === needed,
    isSuggested: !isTouched && picked.length > 0,
    hasNoRoom: suggestion === null,
    isUnchanged: baseline.length > 0 && isSameSelection(picked, baseline),
    onPreviousMonth: handlePreviousMonth,
    onNextMonth: handleNextMonth,
    onSelectDate: setChosenDate,
    onToggleSlot: handleToggleSlot,
    onRemoveSlot: handleRemoveSlot,
    startFrom,
    refresh,
  };
}
