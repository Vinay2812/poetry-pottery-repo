"use client";

import { useCallback, useMemo, useState } from "react";

import { AvailabilitySkeleton } from "@/features/workshops/components/AvailabilitySkeleton";
import {
  BookingCalendar,
  type CalendarDay,
} from "@/features/workshops/components/BookingCalendar";
import { BookingSummary } from "@/features/workshops/components/BookingSummary";
import { DurationPicker } from "@/features/workshops/components/DurationPicker";
import { ParticipantsStepper } from "@/features/workshops/components/ParticipantsStepper";
import type { PickedSlot } from "@/features/workshops/components/PickedSlots";
import {
  SlotList,
  type SlotOption,
} from "@/features/workshops/components/SlotList";
import { useAvailability, useBookWorkshop } from "@/features/workshops/hooks";
import {
  addDays,
  formatDateKey,
  formatHourRange,
  formatMonth,
  isDayWithinSpan,
  isSlotPickable,
  pickableSlots,
  pickTier,
  quoteSession,
  shiftMonth,
  slotsNeeded,
  spanNotice,
  toDateKey,
  toMonthGrid,
  type SlotInterval,
  toMonthKey,
  togglePicked,
  toPickedSlots,
  type WorkshopData,
} from "@/features/workshops/types";

export interface WorkshopBookingContainerProps {
  workshop: WorkshopData;
}

export function WorkshopBookingContainer({
  workshop,
}: WorkshopBookingContainerProps) {
  const todayKey = toDateKey(new Date(), workshop.timezone);
  const firstMonth = toMonthKey(todayKey);
  const [month, setMonth] = useState(firstMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hours, setHours] = useState(workshop.tiers[0]?.hours ?? 1);
  const [participants, setParticipants] = useState(1);
  const [picked, setPicked] = useState<SlotInterval[]>([]);
  const [note, setNote] = useState("");

  const { days, isLoading, refetch } = useAvailability(workshop.slug, month);
  const { book, isBooking } = useBookWorkshop(() => void refetch());

  const needed = slotsNeeded(hours, workshop.slot_minutes);

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

  const pickedDateKeys = useMemo(
    () => picked.map((slot) => toDateKey(slot.starts_at, workshop.timezone)),
    [picked, workshop.timezone],
  );

  const weeks = useMemo<(CalendarDay | null)[][]>(
    () =>
      toMonthGrid(month).map((week) =>
        week.map((dateKey) => {
          if (!dateKey) return null;
          const day = dayByKey.get(dateKey);
          const free = pickableSlots(day, participants);
          const wheelsFree = free.reduce(
            (most, slot) => Math.max(most, slot.remaining),
            0,
          );
          const isWithinSpan = isDayWithinSpan(
            dateKey,
            pickedDateKeys,
            workshop.slot_span_days,
          );
          return {
            dateKey,
            dayNumber: Number(dateKey.slice(8)),
            dayLabel: formatDateKey(dateKey),
            wheelsFree,
            pickedCount: pickedDateKeys.filter((key) => key === dateKey).length,
            isClosed: day?.is_closed ?? true,
            isPast: dateKey < todayKey,
            mutedReason: isWithinSpan
              ? null
              : spanNotice(workshop.slot_span_days),
          };
        }),
      ),
    [
      dayByKey,
      month,
      participants,
      pickedDateKeys,
      todayKey,
      workshop.slot_span_days,
    ],
  );

  const selectedDay = selectedDate ? dayByKey.get(selectedDate) : undefined;
  const slots = useMemo<SlotOption[]>(
    () =>
      (selectedDay?.slots ?? []).map((slot) => ({
        startsAt: slot.starts_at,
        label: formatHourRange(slot.starts_at, slot.ends_at, workshop.timezone),
        wheelsFree: slot.remaining,
        isDisabled: !isSlotPickable(slot, participants),
        reason: slot.is_available
          ? "Not enough wheels"
          : (slot.reason ?? "Not free"),
      })),
    [participants, selectedDay, workshop.timezone],
  );

  const pickedSlots = useMemo<PickedSlot[]>(
    () => toPickedSlots(picked, workshop.timezone),
    [picked, workshop.timezone],
  );
  const pickedStarts = useMemo(
    () => picked.map((slot) => slot.starts_at),
    [picked],
  );

  const tier = pickTier(workshop.tiers, hours);
  const quote = quoteSession(tier, participants);

  const handleSelectDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
  }, []);

  const handleHoursChange = useCallback((value: number) => {
    setHours(value);
    setPicked([]);
  }, []);

  // A bigger group can outgrow an hour that was already picked, so those drop out.
  const handleParticipantsChange = useCallback(
    (value: number) => {
      setParticipants(value);
      setPicked((previous) =>
        previous.filter((picked) => {
          const slot = slotByStart.get(picked.starts_at);
          return !slot || isSlotPickable(slot, value);
        }),
      );
    },
    [slotByStart],
  );

  const handleToggleSlot = useCallback(
    (startsAt: string) => {
      const slot = slotByStart.get(startsAt);
      if (!slot) return;
      setPicked((previous) => togglePicked(previous, slot, needed));
    },
    [needed, slotByStart],
  );

  const handleRemoveSlot = useCallback((startsAt: string) => {
    setPicked((previous) =>
      previous.filter((slot) => slot.starts_at !== startsAt),
    );
  }, []);

  const handleBook = useCallback(() => {
    if (picked.length !== needed) return;
    book({
      configSlug: workshop.slug,
      slotStarts: pickedSlots.map((slot) => slot.startsAt),
      hours,
      participants,
      note,
    });
  }, [
    book,
    hours,
    needed,
    note,
    participants,
    picked.length,
    pickedSlots,
    workshop.slug,
  ]);

  const lastMonth = toMonthKey(addDays(todayKey, workshop.booking_window_days));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 md:px-8 md:py-12">
      {/* The calendar is the page. The title and one sentence are all that sit above it. */}
      <header className="flex flex-col gap-3">
        <h1 className="max-w-3xl font-heading text-3xl leading-tight tracking-tight text-balance md:text-5xl">
          {workshop.name}
        </h1>
        {workshop.description && (
          <p className="max-w-xl text-[15px] text-muted-foreground">
            {workshop.description}
          </p>
        )}
      </header>

      <div className="grid gap-10 border-t border-ash pt-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 md:flex-row md:gap-10">
            <div className="flex flex-col gap-3">
              <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                How long
              </h2>
              <DurationPicker
                tiers={workshop.tiers}
                hours={hours}
                onChange={handleHoursChange}
              />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                How many people
              </h2>
              <ParticipantsStepper
                value={participants}
                max={workshop.capacity_per_slot}
                onChange={handleParticipantsChange}
              />
            </div>
          </div>

          {isLoading ? (
            <AvailabilitySkeleton />
          ) : (
            <BookingCalendar
              monthLabel={formatMonth(month)}
              notice={
                picked.length > 0
                  ? `${spanNotice(workshop.slot_span_days)}. Days further out are closed off.`
                  : null
              }
              weeks={weeks}
              selectedDate={selectedDate}
              canGoBack={month > firstMonth}
              canGoForward={month < lastMonth}
              slotPanel={
                <div className="flex flex-col gap-3">
                  <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                    Hours on {selectedDate ? formatDateKey(selectedDate) : ""}
                  </h3>
                  <SlotList
                    slots={slots}
                    selectedStarts={pickedStarts}
                    emptyMessage="Nothing is free that day."
                    onToggleSlot={handleToggleSlot}
                  />
                </div>
              }
              onPreviousMonth={() => setMonth(shiftMonth(month, -1))}
              onNextMonth={() => setMonth(shiftMonth(month, 1))}
              onSelectDate={handleSelectDate}
            />
          )}

          <p className="text-[13px] text-muted-foreground">
            Pick {needed} {needed === 1 ? "hour" : "hours"} from a day on the
            calendar. They can sit on different days,{" "}
            {spanNotice(workshop.slot_span_days).toLowerCase()}.
          </p>
        </div>

        <aside className="lg:sticky lg:top-24">
          <BookingSummary
            pickedSlots={pickedSlots}
            slotsNeeded={needed}
            hours={hours}
            participants={participants}
            pricePerPerson={tier?.price_per_person ?? 0}
            total={quote.subtotal}
            pieces={quote.pieces}
            note={note}
            canBook={picked.length === needed}
            isBooking={isBooking}
            onNoteChange={setNote}
            onBook={handleBook}
            onRemoveSlot={handleRemoveSlot}
          />
        </aside>
      </div>
    </div>
  );
}
