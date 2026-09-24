"use client";

import { useCallback, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";

import { BookingCalendar } from "@/features/workshops/components/BookingCalendar";
import { BookingSummary } from "@/features/workshops/components/BookingSummary";
import { DurationPicker } from "@/features/workshops/components/DurationPicker";
import { GroupAskLine } from "@/features/workshops/components/GroupAskLine";
import { ParticipantsStepper } from "@/features/workshops/components/ParticipantsStepper";
import { SlotList } from "@/features/workshops/components/SlotList";
import { useBookWorkshop } from "@/features/workshops/hooks";
import { useSlotPicker } from "@/features/workshops/slot-picker";
import {
  formatDateKey,
  pickTier,
  quoteSession,
  SUGGESTED_NOTE,
  toArrangementAskUrl,
  toGroupAskLine,
  toGroupAskUrl,
  toPickingGuide,
  toUnavailableMessage,
  type WorkshopData,
} from "@/features/workshops/types";

export interface WorkshopBookingContainerProps {
  workshop: WorkshopData;
  whatsappNumber: string;
}

export function WorkshopBookingContainer({
  workshop,
  whatsappNumber,
}: WorkshopBookingContainerProps) {
  const [hours, setHours] = useState(workshop.tiers[0]?.hours ?? 1);
  const [participants, setParticipants] = useState(1);
  const [note, setNote] = useState("");

  const picker = useSlotPicker({
    workshop,
    hours,
    participants,
    isSuggesting: true,
  });
  const { refresh, isComplete, picked } = picker;
  const { book, isBooking } = useBookWorkshop(refresh);

  const tier = pickTier(workshop.tiers, hours);
  const quote = quoteSession(tier, participants);

  const handleBook = useCallback(() => {
    if (!isComplete) return;
    book({
      configSlug: workshop.slug,
      slotStarts: picked.map((slot) => slot.starts_at),
      hours,
      participants,
      note,
    });
  }, [book, hours, isComplete, note, participants, picked, workshop.slug]);

  return (
    <PageShell className="flex flex-col gap-10 py-8 md:py-12">
      {/* The calendar is the page. The title, one sentence and the way to pick sit above it. */}
      <header className="flex flex-col gap-3">
        <h1 className="max-w-3xl font-heading text-3xl leading-tight tracking-tight text-balance md:text-5xl">
          {workshop.name}
        </h1>
        {workshop.description && (
          <p className="max-w-xl text-[15px] text-muted-foreground">
            {workshop.description}
          </p>
        )}
        <p className="max-w-xl text-[15px]">
          {toPickingGuide(picker.needed, workshop.slot_span_days)}
        </p>
      </header>

      <div className="grid gap-10 border-t border-ash pt-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                How long
              </h2>
              <DurationPicker
                tiers={workshop.tiers}
                hours={hours}
                onChange={setHours}
              />
            </div>

            <div className="flex flex-col items-start gap-3">
              <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                How many people
              </h2>
              <ParticipantsStepper
                value={participants}
                max={workshop.capacity_per_slot}
                onChange={setParticipants}
              />
              {participants >= workshop.capacity_per_slot && (
                <GroupAskLine
                  line={toGroupAskLine(workshop.capacity_per_slot)}
                  askUrl={toGroupAskUrl(
                    whatsappNumber,
                    workshop.name,
                    workshop.capacity_per_slot,
                  )}
                  contactHref="/contact"
                />
              )}
            </div>
          </div>

          <BookingCalendar
            monthLabel={picker.monthLabel}
            notice={picker.notice}
            weeks={picker.weeks}
            selectedDate={picker.selectedDate}
            canGoBack={picker.canGoBack}
            canGoForward={picker.canGoForward}
            isLoading={picker.isLoading}
            slotPanel={
              <div className="flex flex-col gap-3">
                <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                  Hours on{" "}
                  {picker.selectedDate
                    ? formatDateKey(picker.selectedDate)
                    : ""}
                </h3>
                <SlotList
                  slots={picker.slots}
                  selectedStarts={picker.pickedStarts}
                  emptyMessage="Nothing is free that day."
                  onToggleSlot={picker.onToggleSlot}
                />
              </div>
            }
            onPreviousMonth={picker.onPreviousMonth}
            onNextMonth={picker.onNextMonth}
            onSelectDate={picker.onSelectDate}
          />
        </div>

        <aside className="lg:sticky lg:top-24">
          <BookingSummary
            pickedSlots={picker.pickedSlots}
            slotsNeeded={picker.needed}
            hours={hours}
            participants={participants}
            pricePerPerson={tier?.price_per_person ?? 0}
            total={quote.subtotal}
            pieces={quote.pieces}
            note={note}
            emptyMessage={
              picker.hasNoRoom
                ? toUnavailableMessage(hours, participants)
                : "Pick a day on the calendar, then an hour from the chips under it."
            }
            arrangementAskUrl={
              picker.hasNoRoom
                ? toArrangementAskUrl(
                    whatsappNumber,
                    workshop.name,
                    hours,
                    participants,
                  )
                : null
            }
            hint={picker.isSuggested ? SUGGESTED_NOTE : null}
            canBook={isComplete}
            isBooking={isBooking}
            onNoteChange={setNote}
            onBook={handleBook}
            onRemoveSlot={picker.onRemoveSlot}
          />
        </aside>
      </div>
    </PageShell>
  );
}
