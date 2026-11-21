"use client";

import Image from "next/image";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { cn } from "@/lib/utils";

export interface SuggestionRowProps {
  id: string;
  label: string;
  note: string | null;
  imageUrl?: string | null;
  hasThumbnail?: boolean;
  isActive: boolean;
  isDisabled?: boolean;
  isFirst?: boolean;
  onSelect: () => void;
  onHover: () => void;
}

// One option in the listbox.
export function SuggestionRow({
  id,
  label,
  note,
  imageUrl,
  hasThumbnail = false,
  isActive,
  isDisabled = false,
  isFirst = false,
  onSelect,
  onHover,
}: SuggestionRowProps) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={isActive}
      aria-disabled={isDisabled || undefined}
      // Mouse down keeps focus in the field; the pick waits for a full click, so a right click opens nothing.
      onMouseDown={(event) => event.preventDefault()}
      onClick={isDisabled ? undefined : onSelect}
      // Only a pointer that really moves takes the highlight, so a list scrolled by arrow keys keeps their pick.
      onPointerMove={isDisabled ? undefined : onHover}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 transition-opacity",
        // The first row of a section keeps its heading in view when arrow keys scroll to it.
        isFirst && "scroll-mt-10",
        isDisabled ? "opacity-50" : "cursor-pointer",
        isActive && "bg-ash/60",
      )}
    >
      {hasThumbnail && (
        <span className="relative size-11 shrink-0 overflow-hidden bg-white">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            <PlaceholderImage kind={toPotteryIconKind(label)} />
          )}
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm">{label}</span>
        {/* The highlight tint darkens the row, so the note goes to ink to stay readable on it. */}
        {note && (
          <span
            className={cn(
              "truncate text-[13px]",
              isActive ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {note}
          </span>
        )}
      </span>
    </li>
  );
}
