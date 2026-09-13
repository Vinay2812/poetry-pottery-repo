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
import { Textarea } from "@/components/ui/textarea";

import { AdminField } from "@/features/admin/ui";

export interface ReasonDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  reason: string;
  isBusy: boolean;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

/** The confirm dialog for the steps that owe someone an explanation. */
export function ReasonDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  reason,
  isBusy,
  onReasonChange,
  onConfirm,
  onOpenChange,
}: ReasonDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <AdminField
          id="admin-reason"
          label="Reason"
          hint="Optional. It goes out with the notice."
          error={undefined}
        >
          <Textarea
            id="admin-reason"
            rows={3}
            className="text-[13px]"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
        </AdminField>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Keep as is
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isBusy}
            onClick={onConfirm}
          >
            {isBusy ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
