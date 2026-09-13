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

export interface AdminOrderNoteDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  fieldLabel: string;
  hint: string | null;
  placeholder: string;
  value: string;
  error: string | undefined;
  confirmLabel: string;
  isDestructive: boolean;
  isBusy: boolean;
  onValueChange: (value: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

/** One dialog for the two moves that need a sentence from the studio first. */
export function AdminOrderNoteDialog({
  isOpen,
  title,
  description,
  fieldLabel,
  hint,
  placeholder,
  value,
  error,
  confirmLabel,
  isDestructive,
  isBusy,
  onValueChange,
  onOpenChange,
  onConfirm,
}: AdminOrderNoteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm();
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <AdminField
            id="order-note-dialog-field"
            label={fieldLabel}
            hint={hint}
            error={error}
          >
            <Textarea
              id="order-note-dialog-field"
              rows={3}
              maxLength={300}
              autoFocus
              placeholder={placeholder}
              value={value}
              aria-invalid={error ? true : undefined}
              onChange={(event) => onValueChange(event.target.value)}
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
              type="submit"
              size="sm"
              variant={isDestructive ? "destructive" : "default"}
              disabled={isBusy}
            >
              {isBusy ? "Working…" : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
