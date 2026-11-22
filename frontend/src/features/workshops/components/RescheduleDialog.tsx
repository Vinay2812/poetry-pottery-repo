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
import { formatDateKey, REPLACE_TIME_HINT } from "@/features/workshops/types";
import { SectionLabel } from "@/components/layout/SectionLabel";

export interface RescheduleDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  hasError: boolean;
  monthLabel: string;
  notice: string | null;
  weeks: (CalendarDay | null)[][];
  selectedDate: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
  slots: SlotOption[];
  pickedSlots: PickedSlot[];
  progress: string;
  isComplete: boolean;
  isSwapHintShown: boolean;
  isUnchanged: boolean;
  isSubmitting: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
  onToggleSlot: (startsAt: string) => void;
  onRemoveSlot: (startsAt: string) => void;
  onRetryPickCheck: (() => void) | null;
  onConfirm: () => void;
  onRetry: () => void;
}

export function RescheduleDialog({
  isOpen,
  isLoading,
  hasError,
  monthLabel,
  weeks,
  selectedDate,
  canGoBack,
  canGoForward,
  slots,
  pickedSlots,
  progress,
  isComplete,
  isSwapHintShown,
  isUnchanged,
  isSubmitting,
  onOpenChange,
  onPreviousMonth,
  onNextMonth,
  notice,
  onSelectDate,
  onToggleSlot,
  onRemoveSlot,
  onRetryPickCheck,
  onConfirm,
  onRetry,
}: RescheduleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {/* Left-aligned on phones too, so the header lines up with the text under it. */}
        <DialogHeader className="text-left">
          <DialogTitle className="font-heading text-2xl font-normal tracking-tight">
            Move this session
          </DialogTitle>
          <DialogDescription>
            Pick the times again. The session keeps its length and the same
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
          hasError={hasError}
          // Same as the booking page: the hours open under the week of the picked day.
          slotPanel={
            selectedDate && (
              <div className="flex flex-col gap-3">
                <SectionLabel level={3}>
                  Times on {formatDateKey(selectedDate)}
                </SectionLabel>
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
          onRetry={onRetry}
        />

        <PickedSlots
          slots={pickedSlots}
          progress={progress}
          emptyMessage="Pick your times from the calendar."
          onRemoveSlot={onRemoveSlot}
          onRetryCheck={onRetryPickCheck}
        />
        {isSwapHintShown && (
          <p className="text-[13px] text-muted-foreground">
            {REPLACE_TIME_HINT}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Keep current times
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting || !isComplete || isUnchanged}
          >
            {isSubmitting ? "Moving…" : "Move session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
