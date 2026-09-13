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
  SlotList,
  type SlotOption,
} from "@/features/workshops/components/SlotList";

export interface RescheduleDialogProps {
  isOpen: boolean;
  monthLabel: string;
  weeks: (CalendarDay | null)[][];
  selectedDate: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  slots: SlotOption[];
  selectedStart: string | null;
  isSubmitting: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
  onSelectSlot: (startsAt: string) => void;
  onConfirm: () => void;
}

export function RescheduleDialog({
  isOpen,
  monthLabel,
  weeks,
  selectedDate,
  canGoBack,
  canGoForward,
  slots,
  selectedStart,
  isSubmitting,
  onOpenChange,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
  onSelectSlot,
  onConfirm,
}: RescheduleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal tracking-tight">
            Move this session
          </DialogTitle>
          <DialogDescription>
            Pick another day and start time. The session keeps its length and
            the same number of people.
          </DialogDescription>
        </DialogHeader>

        <BookingCalendar
          monthLabel={monthLabel}
          weeks={weeks}
          selectedDate={selectedDate}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
          onSelectDate={onSelectDate}
        />

        <SlotList
          slots={slots}
          selectedStart={selectedStart}
          emptyMessage={
            selectedDate
              ? "Nothing long enough is free that day."
              : "Pick a day to see start times."
          }
          onSelectSlot={onSelectSlot}
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
            disabled={isSubmitting || selectedStart === null}
          >
            {isSubmitting ? "Moving…" : "Move session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
