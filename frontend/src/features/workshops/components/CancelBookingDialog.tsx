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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRestoreFocus } from "@/lib/use-restore-focus";

export interface CancelBookingDialogProps {
  isOpen: boolean;
  reason: string;
  isSubmitting: boolean;
  onReasonChange: (reason: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export function CancelBookingDialog({
  isOpen,
  reason,
  isSubmitting,
  onReasonChange,
  onOpenChange,
  onConfirm,
}: CancelBookingDialogProps) {
  const restoreFocus = useRestoreFocus();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={restoreFocus.onOpenAutoFocus}
        onCloseAutoFocus={restoreFocus.onCloseAutoFocus}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal tracking-tight">
            Cancel this session?
          </DialogTitle>
          <DialogDescription>
            The wheel goes back to the studio straight away. You can book
            another day any time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cancel-booking-reason">Tell us why (optional)</Label>
          <Textarea
            id="cancel-booking-reason"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Something came up, travelling that week…"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Keep session
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cancelling…" : "Cancel session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
