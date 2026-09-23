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
import { useRestoreFocus } from "@/lib/use-restore-focus";

export interface SignInPromptDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export function SignInPromptDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: SignInPromptDialogProps) {
  const restoreFocus = useRestoreFocus();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={restoreFocus.onOpenAutoFocus}
        onCloseAutoFocus={restoreFocus.onCloseAutoFocus}
        className="max-w-sm"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal tracking-tight">
            Sign in to continue
          </DialogTitle>
          <DialogDescription>
            Your cart, saved pieces and bookings live in your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button onClick={onConfirm}>Sign in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
