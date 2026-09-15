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

import { AdminField } from "@/features/admin/ui/components/AdminField";

export interface AdminReasonDialogProps {
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
  isRequired: boolean;
  isBusy: boolean;
  onValueChange: (value: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

/** One dialog for every admin move that owes someone a sentence first. */
export function AdminReasonDialog({
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
  isRequired,
  isBusy,
  onValueChange,
  onOpenChange,
  onConfirm,
}: AdminReasonDialogProps) {
  const isEmpty = value.trim() === "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (isRequired && isEmpty) return;
            onConfirm();
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <AdminField
            id="admin-reason-dialog-field"
            label={fieldLabel}
            hint={hint}
            error={error}
          >
            <Textarea
              id="admin-reason-dialog-field"
              rows={3}
              maxLength={300}
              autoFocus
              className="text-[13px]"
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
              disabled={isBusy || (isRequired && isEmpty)}
            >
              {isBusy ? "Working…" : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
