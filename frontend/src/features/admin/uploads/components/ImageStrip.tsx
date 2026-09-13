"use client";

import { Button } from "@/components/ui/button";

export interface ImageStripProps {
  urls: string[];
  isBusy: boolean;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (index: number) => void;
}

/** Photos in the order they render, with the first one marked as the one on cards. */
export function ImageStrip({
  urls,
  isBusy,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ImageStripProps) {
  if (urls.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground">
        No photos yet. The first one you add leads on the card.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {urls.map((url, index) => (
        <li key={url} className="flex w-24 flex-col gap-1">
          <div className="relative size-24 border border-ash bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-full object-cover" />
            {index === 0 && (
              <span className="absolute bottom-0 left-0 bg-ink px-1 text-[10px] tracking-[0.08em] text-white uppercase">
                Lead
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label={`Move photo ${index + 1} earlier`}
              disabled={isBusy || index === 0}
              onClick={() => onMoveUp(index)}
            >
              ←
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label={`Move photo ${index + 1} later`}
              disabled={isBusy || index === urls.length - 1}
              onClick={() => onMoveDown(index)}
            >
              →
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label={`Remove photo ${index + 1}`}
              disabled={isBusy}
              onClick={() => onRemove(index)}
            >
              ×
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
