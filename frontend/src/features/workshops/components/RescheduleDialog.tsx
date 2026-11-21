"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  BookingCalendar,
  type CalendarDay,
} from "@/features/workshops/components/BookingCalendar";
import {
  PickedSlots,
  type PickedSlot,
} from "@/features/workshops/components/PickedSlots";
import {
  SlotList,
  type SlotOption,
} from "@/features/workshops/components/SlotList";
import { formatDateKey } from "@/features/workshops/types";

export interface RescheduleDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  monthLabel: string;
  notice: string | null;
  weeks: (CalendarDay | null)[][];
  selectedDate: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  slots: SlotOption[];
  pickedSlots: PickedSlot[];
  slotsNeeded: number;
  isUnchanged: boolean;
  isSubmitting: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
  onToggleSlot: (startsAt: string) => void;
  onRemoveSlot: (startsAt: string) => void;
  onConfirm: () => void;
}

export function RescheduleDialog({
  isOpen,
  isLoading,
  monthLabel,
  weeks,
  selectedDate,
  canGoBack,
  canGoForward,
  slots,
  pickedSlots,
  slotsNeeded,
  isUnchanged,
  isSubmitting,
  onOpenChange,
  onPreviousMonth,
  onNextMonth,
  notice,
  onSelectDate,
  onToggleSlot,
  onRemoveSlot,
  onConfirm,
}: RescheduleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal tracking-tight">
            Move this session
          </DialogTitle>
          <DialogDescription>
            Pick the hours again. The session keeps its length and the same
            number of people.
          </DialogDescription>
        </DialogHeader>

        <BookingCalendar
          monthLabel={monthLabel}
          notice={notice}
          weeks={weeks}
          selectedDate={selectedDate}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          isLoading={isLoading}
          // Same as the booking page: the hours open under the week of the picked day.
          slotPanel={
            selectedDate && (
              <div className="flex flex-col gap-3">
                <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                  Hours on {formatDateKey(selectedDate)}
                </h3>
                <SlotList
                  slots={slots}
                  selectedStarts={pickedSlots.map((slot) => slot.startsAt)}
                  emptyMessage="Nothing is free that day."
                  onToggleSlot={onToggleSlot}
                />
              </div>
            )
          }
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
          onSelectDate={onSelectDate}
        />

        <PickedSlots
          slots={pickedSlots}
          needed={slotsNeeded}
          emptyMessage="Pick your hours from the calendar."
          onRemoveSlot={onRemoveSlot}
        />

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Keep the old day
          </Button>
          <Button
            onClick={onConfirm}
            disabled={
              isSubmitting || pickedSlots.length !== slotsNeeded || isUnchanged
            }
          >
            {isSubmitting ? "Moving…" : "Move session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
