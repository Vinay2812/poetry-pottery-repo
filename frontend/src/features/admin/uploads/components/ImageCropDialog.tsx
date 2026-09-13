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

export interface ImageCropDialogProps {
  isOpen: boolean;
  reason: string;
  ratioLabel: string;
  previewUrl: string | null;
  cropWidth: number;
  cropHeight: number;
  isBusy: boolean;
  onConfirm: () => void;
  onOpenChange: (isOpen: boolean) => void;
}

export function ImageCropDialog({
  isOpen,
  reason,
  ratioLabel,
  previewUrl,
  cropWidth,
  cropHeight,
  isBusy,
  onConfirm,
  onOpenChange,
}: ImageCropDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop to {ratioLabel}</DialogTitle>
          <DialogDescription>
            {reason} Here is the middle of it at {cropWidth} × {cropHeight}.
          </DialogDescription>
        </DialogHeader>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="The crop that will be uploaded"
            className="max-h-72 w-full border border-ash bg-white object-contain"
          />
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Pick another file
          </Button>
          <Button type="button" size="sm" disabled={isBusy} onClick={onConfirm}>
            {isBusy ? "Uploading…" : "Use this crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
