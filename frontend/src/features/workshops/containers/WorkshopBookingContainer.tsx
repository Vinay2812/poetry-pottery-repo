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
import {
  SlotList,
  type SlotOption,
} from "@/features/workshops/components/SlotList";
import { WorkshopIntro } from "@/features/workshops/components/WorkshopIntro";
import { useAvailability, useBookWorkshop } from "@/features/workshops/hooks";
import {
  addDays,
  bookableStarts,
  formatDateKey,
  formatMonth,
  formatSlotRange,
  pickTier,
  quoteSession,
  sessionCapacity,
  shiftMonth,
  toDateKey,
  toMonthGrid,
  toMonthKey,
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
  const [start, setStart] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const { days, isLoading, refetch } = useAvailability(workshop.slug, month);
  const { book, isBooking } = useBookWorkshop(() => void refetch());

  const dayByKey = useMemo(
    () => new Map(days.map((day) => [day.date, day])),
    [days],
  );

  const weeks = useMemo<(CalendarDay | null)[][]>(
    () =>
      toMonthGrid(month).map((week) =>
        week.map((dateKey) => {
          if (!dateKey) return null;
          const day = dayByKey.get(dateKey);
          const starts = bookableStarts(
            day,
            hours,
            participants,
            workshop.slot_minutes,
          );
          const wheelsFree = starts.reduce(
            (most, slot) =>
              Math.max(
                most,
                sessionCapacity(
                  day?.slots ?? [],
                  slot.starts_at,
                  hours,
                  workshop.slot_minutes,
                ),
              ),
            0,
          );
          return {
            dateKey,
            dayNumber: Number(dateKey.slice(8)),
            dayLabel: formatDateKey(dateKey),
            wheelsFree,
            isClosed: day?.is_closed ?? true,
            isPast: dateKey < todayKey,
          };
        }),
      ),
    [dayByKey, hours, month, participants, todayKey, workshop.slot_minutes],
  );

  const selectedDay = selectedDate ? dayByKey.get(selectedDate) : undefined;
  const slots = useMemo<SlotOption[]>(
    () =>
      bookableStarts(
        selectedDay,
        hours,
        participants,
        workshop.slot_minutes,
      ).map((slot) => ({
        startsAt: slot.starts_at,
        label: formatSlotRange(
          slot.starts_at,
          new Date(
            new Date(slot.starts_at).getTime() + hours * 3_600_000,
          ).toISOString(),
          workshop.timezone,
        ),
        wheelsFree: sessionCapacity(
          selectedDay?.slots ?? [],
          slot.starts_at,
          hours,
          workshop.slot_minutes,
        ),
      })),
    [
      hours,
      participants,
      selectedDay,
      workshop.slot_minutes,
      workshop.timezone,
    ],
  );

  const tier = pickTier(workshop.tiers, hours);
  const quote = quoteSession(tier, participants);

  const handleSelectDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
    setStart(null);
  }, []);

  const handleHoursChange = useCallback((value: number) => {
    setHours(value);
    setStart(null);
  }, []);

  const handleParticipantsChange = useCallback((value: number) => {
    setParticipants(value);
    setStart(null);
  }, []);

  const handleBook = useCallback(() => {
    if (!start) return;
    book({
      configSlug: workshop.slug,
      startsAt: start,
      hours,
      participants,
      note,
    });
  }, [book, hours, note, participants, start, workshop.slug]);

  const selectedSlot = slots.find((slot) => slot.startsAt === start) ?? null;
  const lastMonth = toMonthKey(addDays(todayKey, workshop.booking_window_days));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8 md:px-6 md:py-12">
      <WorkshopIntro
        name={workshop.name}
        description={workshop.description}
        imageUrl={workshop.image_url}
        tiers={workshop.tiers}
        href={null}
      />

      <div className="grid gap-10 border-t border-ash pt-10 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-8">
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

          {isLoading ? (
            <AvailabilitySkeleton />
          ) : (
            <BookingCalendar
              monthLabel={formatMonth(month)}
              weeks={weeks}
              selectedDate={selectedDate}
              canGoBack={month > firstMonth}
              canGoForward={month < lastMonth}
              onPreviousMonth={() => setMonth(shiftMonth(month, -1))}
              onNextMonth={() => setMonth(shiftMonth(month, 1))}
              onSelectDate={handleSelectDate}
            />
          )}

          <div className="flex flex-col gap-3">
            <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              Start time
            </h2>
            <SlotList
              slots={slots}
              selectedStart={start}
              emptyMessage={
                selectedDate
                  ? "Nothing long enough is free that day."
                  : "Pick a day to see start times."
              }
              onSelectSlot={setStart}
            />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <BookingSummary
            dateLabel={selectedDate ? formatDateKey(selectedDate) : null}
            timeLabel={selectedSlot?.label ?? null}
            hours={hours}
            participants={participants}
            pricePerPerson={tier?.price_per_person ?? 0}
            total={quote.subtotal}
            pieces={quote.pieces}
            note={note}
            canBook={start !== null}
            isBooking={isBooking}
            onNoteChange={setNote}
            onBook={handleBook}
          />
        </aside>
      </div>
    </div>
  );
}
