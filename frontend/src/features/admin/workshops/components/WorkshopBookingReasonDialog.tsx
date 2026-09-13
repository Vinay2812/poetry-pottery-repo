"use client";

import { useState } from "react";

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

export interface WorkshopBookingReasonDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isBusy: boolean;
  onConfirm: (reason: string) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function WorkshopBookingReasonDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  isBusy,
  onConfirm,
  onOpenChange,
}: WorkshopBookingReasonDialogProps) {
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          id="workshop-reason-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (trimmed) onConfirm(trimmed);
          }}
        >
          <AdminField
            id="booking-reason"
            label="Reason"
            hint="The guest reads this, so keep it kind"
            error={undefined}
          >
            <Textarea
              id="booking-reason"
              className="text-[13px]"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </AdminField>
        </form>
        <DialogFooter>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Keep as is
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="destructive"
            form="workshop-reason-form"
            disabled={isBusy || trimmed === ""}
          >
            {isBusy ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
