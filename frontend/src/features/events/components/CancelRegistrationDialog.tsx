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

export interface CancelRegistrationDialogProps {
  isOpen: boolean;
  reason: string;
  isSubmitting: boolean;
  onReasonChange: (reason: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export function CancelRegistrationDialog({
  isOpen,
  reason,
  isSubmitting,
  onReasonChange,
  onOpenChange,
  onConfirm,
}: CancelRegistrationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal tracking-tight">
            Cancel this booking?
          </DialogTitle>
          <DialogDescription>
            Your seats go back to the studio straight away. You can book another
            date any time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cancel-registration-reason">
            Tell us why (optional)
          </Label>
          <Textarea
            id="cancel-registration-reason"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Something came up, travelling that weekend…"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Keep booking
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cancelling…" : "Cancel booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
