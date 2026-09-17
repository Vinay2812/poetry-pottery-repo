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
  onSelect: () => void;
  onHover: () => void;
}

// One option in the listbox. Mouse down rather than click, so the field never loses focus first.
export function SuggestionRow({
  id,
  label,
  note,
  imageUrl,
  hasThumbnail = false,
  isActive,
  onSelect,
  onHover,
}: SuggestionRowProps) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={isActive}
      onMouseDown={(event) => {
        event.preventDefault();
        onSelect();
      }}
      onMouseEnter={onHover}
      className={cn(
        "flex cursor-pointer items-center gap-3 px-4 py-2.5",
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
