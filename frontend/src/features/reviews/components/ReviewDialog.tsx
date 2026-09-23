"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRestoreFocus } from "@/lib/use-restore-focus";

export interface ReviewDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onOpenChange: (isOpen: boolean) => void;
  children: React.ReactNode;
}

export function ReviewDialog({
  isOpen,
  title,
  description,
  onOpenChange,
  children,
}: ReviewDialogProps) {
  const restoreFocus = useRestoreFocus();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={restoreFocus.onOpenAutoFocus}
        onCloseAutoFocus={restoreFocus.onCloseAutoFocus}
        className="max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
