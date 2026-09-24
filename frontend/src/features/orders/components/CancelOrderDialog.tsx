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

export interface CancelOrderDialogProps {
  isOpen: boolean;
  reason: string;
  isSubmitting: boolean;
  onReasonChange: (reason: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export function CancelOrderDialog({
  isOpen,
  reason,
  isSubmitting,
  onReasonChange,
  onOpenChange,
  onConfirm,
}: CancelOrderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal tracking-tight">
            Cancel this order?
          </DialogTitle>
          <DialogDescription>
            The pieces go back on the shelf straight away.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="cancel-reason"
            className="text-[13px] text-muted-foreground"
          >
            Tell us why (optional)
          </Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Changed my mind, ordered the wrong size"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Keep order
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Cancelling…" : "Cancel order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
