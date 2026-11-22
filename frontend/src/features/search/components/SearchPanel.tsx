"use client";

import { Search, X } from "lucide-react";

import { SuggestionRow } from "@/features/search/components/SuggestionRow";
import { toInputId, toOptionId } from "@/features/search/types";

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
  // Rows answer an older word while the new one is looked up; they show but cannot be picked.
  isStale?: boolean;
  hint: string;
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
  isDisabled?: boolean;
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
  isDisabled = false,
  onSelectIndex,
  onHoverIndex,
}: SectionProps) {
  if (entries.length === 0) return null;
  return (
    <>
      <li
        role="presentation"
        // About 37px tall (16 + an 11px line + 6); SuggestionRow's scroll-mt-10 clears it, so change both together.
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
          isActive={!isDisabled && activeIndex === offset + index}
          isDisabled={isDisabled}
          isFirst={index === 0}
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
  isStale = false,
  hint,
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
    // On a short screen the list gives up height first, so the field and the hint stay on screen.
    <div className="flex min-h-0 flex-col border-b border-ash bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-col px-4 md:px-8">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex h-16 shrink-0 items-center gap-3"
        >
          {/* The outline wraps the icon and the field together, the way the shelf's search box does. */}
          <div className="flex h-10 min-w-0 flex-1 items-center gap-3 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ink">
            <Search
              className="size-5 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden
            />
            <input
              autoFocus
              id={toInputId(panelId)}
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
              className="h-10 w-full min-w-0 bg-transparent text-[15px] placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </div>
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
          // Rows bleed 16px past the column so their text lines up with the field's icon.
          className="-mx-4 max-h-[60vh] min-h-0 overflow-y-auto pb-3"
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
            isDisabled={isStale}
            entries={pieces}
            offset={piecesOffset}
            panelId={panelId}
            activeIndex={activeIndex}
            hasThumbnails
            onSelectIndex={onSelectIndex}
            onHoverIndex={onHoverIndex}
          />
          <Section
            title="Events"
            isDisabled={isStale}
            entries={events}
            offset={eventsOffset}
            panelId={panelId}
            activeIndex={activeIndex}
            onSelectIndex={onSelectIndex}
            onHoverIndex={onHoverIndex}
          />
          <Section
            title="Wheel sessions"
            isDisabled={isStale}
            entries={workshops}
            offset={workshopsOffset}
            panelId={panelId}
            activeIndex={activeIndex}
            onSelectIndex={onSelectIndex}
            onHoverIndex={onHoverIndex}
          />
        </ul>

        <div className="flex shrink-0 items-start justify-between gap-4 border-t border-ash py-3">
          <p
            aria-live="polite"
            className="min-w-0 text-[13px] [overflow-wrap:anywhere] text-muted-foreground"
          >
            {hint}
          </p>
          {recents.length > 0 && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onClearRecents}
              className="shrink-0 link-underline text-[13px] text-muted-foreground"
            >
              Clear recent searches
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
