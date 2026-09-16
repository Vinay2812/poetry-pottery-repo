"use client";

import { Search, X } from "lucide-react";

import { SuggestionRow } from "@/features/search/components/SuggestionRow";
import { toOptionId } from "@/features/search/types";

export interface SearchPanelEntry {
  key: string;
  label: string;
  note: string | null;
  imageUrl?: string | null;
}

export interface SearchPanelProps {
  panelId: string;
  value: string;
  activeIndex: number;
  isLoading: boolean;
  recents: SearchPanelEntry[];
  pieces: SearchPanelEntry[];
  events: SearchPanelEntry[];
  workshops: SearchPanelEntry[];
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSelectIndex: (index: number) => void;
  onHoverIndex: (index: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onClearRecents: () => void;
}

interface SectionProps {
  title: string;
  entries: SearchPanelEntry[];
  offset: number;
  panelId: string;
  activeIndex: number;
  hasThumbnails?: boolean;
  onSelectIndex: (index: number) => void;
  onHoverIndex: (index: number) => void;
}

function Section({
  title,
  entries,
  offset,
  panelId,
  activeIndex,
  hasThumbnails = false,
  onSelectIndex,
  onHoverIndex,
}: SectionProps) {
  if (entries.length === 0) return null;
  return (
    <>
      <li
        role="presentation"
        className="px-4 pt-4 pb-1.5 text-[11px] tracking-[0.18em] text-muted-foreground uppercase"
      >
        {title}
      </li>
      {entries.map((entry, index) => (
        <SuggestionRow
          key={entry.key}
          id={toOptionId(panelId, offset + index)}
          label={entry.label}
          note={entry.note}
          imageUrl={entry.imageUrl}
          hasThumbnail={hasThumbnails}
          isActive={activeIndex === offset + index}
          onSelect={() => onSelectIndex(offset + index)}
          onHover={() => onHoverIndex(offset + index)}
        />
      ))}
    </>
  );
}

/**
 * The field and its listbox. Sits in a fixed overlay under the header, so opening it
 * never moves the header or the page under it.
 */
export function SearchPanel({
  panelId,
  value,
  activeIndex,
  isLoading,
  recents,
  pieces,
  events,
  workshops,
  onChange,
  onSubmit,
  onSelectIndex,
  onHoverIndex,
  onKeyDown,
  onClose,
  onClearRecents,
}: SearchPanelProps) {
  const listboxId = `${panelId}-listbox`;
  const piecesOffset = recents.length;
  const eventsOffset = piecesOffset + pieces.length;
  const workshopsOffset = eventsOffset + events.length;
  const total = workshopsOffset + workshops.length;

  return (
    <div className="border-b border-ash bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 md:px-8">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex h-16 items-center gap-3"
        >
          <Search
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            autoFocus
            type="search"
            role="combobox"
            value={value}
            aria-label="Search the studio"
            aria-expanded={total > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? toOptionId(panelId, activeIndex) : undefined
            }
            placeholder="Try “tea cup”, “sage green” or “wheel session”"
            autoComplete="off"
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            className="h-10 w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex size-10 shrink-0 items-center justify-center ghost-hover hover:text-primary"
          >
            <X className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        </form>

        {/* The list keeps its box whether or not it has rows, so the panel does not jump. */}
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Suggestions"
          aria-busy={isLoading}
          className="max-h-[60vh] overflow-y-auto pb-3"
        >
          <Section
            title="Recent searches"
            entries={recents}
            offset={0}
            panelId={panelId}
            activeIndex={activeIndex}
            onSelectIndex={onSelectIndex}
            onHoverIndex={onHoverIndex}
          />
          <Section
            title="Pieces"
            entries={pieces}
            offset={piecesOffset}
            panelId={panelId}
            activeIndex={activeIndex}
            hasThumbnails
            onSelectIndex={onSelectIndex}
            onHoverIndex={onHoverIndex}
          />
          <Section
            title="Evenings"
            entries={events}
            offset={eventsOffset}
            panelId={panelId}
            activeIndex={activeIndex}
            onSelectIndex={onSelectIndex}
            onHoverIndex={onHoverIndex}
          />
          <Section
            title="At the wheel"
            entries={workshops}
            offset={workshopsOffset}
            panelId={panelId}
            activeIndex={activeIndex}
            onSelectIndex={onSelectIndex}
            onHoverIndex={onHoverIndex}
          />
        </ul>

        <div className="flex items-center justify-between gap-4 border-t border-ash py-3">
          <p className="text-[13px] text-muted-foreground">
            {value.trim().length > 0
              ? "Press Enter to search everything."
              : "Type a glaze, a clay body or what you want to use it for."}
          </p>
          {recents.length > 0 && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onClearRecents}
              className="link-underline text-[13px] text-muted-foreground"
            >
              Clear recent searches
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
