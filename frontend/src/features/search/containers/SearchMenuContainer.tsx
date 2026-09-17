"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { useSuggestQuery } from "@/graphql/generated/graphql";
import { formatDate, formatInr } from "@/lib/format";

import {
  SearchPanel,
  type SearchPanelEntry,
} from "@/features/search/components/SearchPanel";
import { useDebouncedTerm } from "@/features/search/hooks";
import {
  addRecentSearch,
  MIN_SUGGEST_LENGTH,
  nextActiveIndex,
  parseRecentSearches,
  RECENT_SEARCH_KEY,
  type SuggestOption,
  type SuggestOptionLists,
  toOptionOrder,
  toSearchHref,
} from "@/features/search/types";

export interface SearchMenuContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

// The panel mounts only while it is open, so its state starts from the stored list each time.
export function SearchMenuContainer({
  isOpen,
  onClose,
}: SearchMenuContainerProps) {
  if (!isOpen) return null;
  return <SearchMenu onClose={onClose} />;
}

function SearchMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const panelId = useId();
  const [value, setValue] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recents, setRecents] = useState<string[]>(() =>
    parseRecentSearches(localStorage.getItem(RECENT_SEARCH_KEY)),
  );

  const term = useDebouncedTerm(value);
  const isTermReady = term.length >= MIN_SUGGEST_LENGTH;

  // Escape closes from anywhere, not just from the field.
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  const { data, previousData, loading } = useSuggestQuery({
    variables: { q: term },
    skip: !isTermReady,
  });
  // Previous rows stay up while the next ones load, so the list never blinks empty.
  const suggestions = isTermReady
    ? (data?.suggest ?? previousData?.suggest)
    : undefined;

  const lists = useMemo<SuggestOptionLists>(
    () => ({
      recents: recents.map((entry, index) => ({
        id: `recent-${index}`,
        label: entry,
        href: toSearchHref(entry),
      })),
      pieces: (suggestions?.pieces ?? []).map((piece) => ({
        id: `piece-${piece.id}`,
        label: piece.name,
        href: `/products/${piece.slug}`,
      })),
      events: (suggestions?.events ?? []).map((event) => ({
        id: `event-${event.id}`,
        label: event.title,
        href: `/events/${event.slug}`,
      })),
      workshops: (suggestions?.workshops ?? []).map((workshop) => ({
        id: `workshop-${workshop.id}`,
        label: workshop.name,
        href: `/workshops/${workshop.slug}`,
      })),
    }),
    [recents, suggestions],
  );
  const options = useMemo(() => toOptionOrder(lists), [lists]);

  const recentEntries = useMemo<SearchPanelEntry[]>(
    () => recents.map((entry) => ({ key: entry, label: entry, note: null })),
    [recents],
  );
  const pieceEntries = useMemo<SearchPanelEntry[]>(
    () =>
      (suggestions?.pieces ?? []).map((piece) => ({
        key: `piece-${piece.id}`,
        label: piece.name,
        note: piece.is_archived ? "In the archive" : formatInr(piece.price),
        imageUrl: piece.image_url,
      })),
    [suggestions],
  );
  const eventEntries = useMemo<SearchPanelEntry[]>(
    () =>
      (suggestions?.events ?? []).map((event) => ({
        key: `event-${event.id}`,
        label: event.title,
        note: formatDate(event.starts_at),
      })),
    [suggestions],
  );
  const workshopEntries = useMemo<SearchPanelEntry[]>(
    () =>
      (suggestions?.workshops ?? []).map((workshop) => ({
        key: `workshop-${workshop.id}`,
        label: workshop.name,
        note: "Book an hour at the wheel",
      })),
    [suggestions],
  );

  // Written outside the state updater: choosing a suggestion closes the panel at once,
  // and an updater queued on an unmounting component would never reach localStorage.
  const remember = useCallback(
    (entry: string) => {
      const next = addRecentSearch(recents, entry);
      localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
      setRecents(next);
    },
    [recents],
  );

  const handleChange = useCallback((next: string) => {
    setValue(next);
    setActiveIndex(-1);
  }, []);

  const go = useCallback(
    (option: SuggestOption) => {
      remember(option.label);
      onClose();
      router.push(option.href);
    },
    [onClose, remember, router],
  );

  const handleSubmit = useCallback(() => {
    const active = activeIndex >= 0 ? options[activeIndex] : undefined;
    if (active) {
      go(active);
      return;
    }
    const entry = value.trim();
    if (entry.length === 0) return;
    remember(entry);
    onClose();
    router.push(toSearchHref(entry));
  }, [activeIndex, go, onClose, options, remember, router, value]);

  const handleSelectIndex = useCallback(
    (index: number) => {
      const option = options[index];
      if (option) go(option);
    },
    [go, options],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) =>
          nextActiveIndex(
            current,
            options.length,
            event.key === "ArrowDown" ? 1 : -1,
          ),
        );
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    },
    [onClose, options.length],
  );

  const handleClearRecents = useCallback(() => {
    localStorage.removeItem(RECENT_SEARCH_KEY);
    setRecents([]);
    setActiveIndex(-1);
  }, []);

  return (
    // The overlay starts at the top of the viewport, so the panel lands in the same place
    // whether or not the announcement bar has scrolled away and nothing under it moves.
    <div className="fixed inset-0 z-50">
      <SearchPanel
        panelId={panelId}
        value={value}
        activeIndex={activeIndex}
        isLoading={loading}
        recents={recentEntries}
        pieces={pieceEntries}
        events={eventEntries}
        workshops={workshopEntries}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onSelectIndex={handleSelectIndex}
        onHoverIndex={setActiveIndex}
        onKeyDown={handleKeyDown}
        onClose={onClose}
        onClearRecents={handleClearRecents}
      />
      {/* Anything outside the panel dismisses it, the way a menu does. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onMouseDown={onClose}
        className="size-full cursor-default bg-ink/10"
      />
    </div>
  );
}
