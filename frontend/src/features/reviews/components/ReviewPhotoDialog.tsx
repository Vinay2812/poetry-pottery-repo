"use client";

import Image from "next/image";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRestoreFocus } from "@/lib/use-restore-focus";

export interface ReviewPhotoDialogProps {
  isOpen: boolean;
  url: string | null;
  alt: string;
  onOpenChange: (isOpen: boolean) => void;
}

export function ReviewPhotoDialog({
  isOpen,
  url,
  alt,
  onOpenChange,
}: ReviewPhotoDialogProps) {
  const restoreFocus = useRestoreFocus();
  return (
    <Dialog open={isOpen && url !== null} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={restoreFocus.onOpenAutoFocus}
        onCloseAutoFocus={restoreFocus.onCloseAutoFocus}
        className="max-w-2xl p-0 md:p-0"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        {url && (
          <span className="relative block aspect-square w-full bg-white">
            <Image
              src={url}
              alt={alt}
              fill
              sizes="(min-width: 768px) 640px, 100vw"
              className="object-contain"
            />
          </span>
        )}
      </DialogContent>
    </Dialog>
  );
}
