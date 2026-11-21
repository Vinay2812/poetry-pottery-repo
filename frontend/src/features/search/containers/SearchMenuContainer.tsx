"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useMemo, useState } from "react";

import { useQuery } from "@apollo/client/react";
import { SuggestDocument } from "@/graphql/generated/graphql";
import { formatDate, formatInr } from "@/lib/format";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import {
  SearchPanel,
  type SearchPanelEntry,
} from "@/features/search/components/SearchPanel";
import { useDebouncedTerm } from "@/features/search/hooks";
import {
  addRecentSearch,
  isSuggestPending,
  MIN_SUGGEST_LENGTH,
  nextActiveIndex,
  parseRecentSearches,
  RECENT_SEARCH_KEY,
  type SuggestOption,
  type SuggestOptionLists,
  toInputId,
  toOptionId,
  toOptionOrder,
  toSearchHint,
  toSearchHref,
  toSelectableLists,
} from "@/features/search/types";

export interface SearchMenuContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

// A top sheet, so focus stays inside, Escape and outside clicks close it, and focus goes back
// to whatever opened it. Its content unmounts on close, so each open starts from the stored list.
export function SearchMenuContainer({
  isOpen,
  onClose,
}: SearchMenuContainerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="top"
        showCloseButton={false}
        aria-describedby={undefined}
        // The panel draws its own bottom rule.
        // A lighter dim than the menu: the page stays readable under a panel that only hangs from the top.
        overlayClassName="bg-ink/10"
        className="max-h-dvh gap-0 border-b-0 bg-background shadow-none"
      >
        <SheetTitle className="sr-only">Search the studio</SheetTitle>
        <SearchMenu onClose={onClose} />
      </SheetContent>
    </Sheet>
  );
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

  const { data, previousData, loading, error } = useQuery(SuggestDocument, {
    variables: { q: term },
    skip: !isTermReady,
  });
  const isError = error !== undefined;
  const isPending = isSuggestPending(value, term, loading);
  // Previous rows stay up while the next ones load, so the list never blinks empty;
  // a failed lookup clears them so the panel does not offer answers to another word.
  const suggestions =
    isTermReady && !isError
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
  const options = useMemo(
    () => toOptionOrder(toSelectableLists(lists, isPending)),
    [lists, isPending],
  );
  const hint = toSearchHint({
    value,
    isPending,
    isError,
    resultCount:
      lists.pieces.length + lists.events.length + lists.workshops.length,
  });

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
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const next = nextActiveIndex(
        activeIndex,
        options.length,
        event.key === "ArrowDown" ? 1 : -1,
      );
      setActiveIndex(next);
      // Arrow keys can reach rows scrolled out of the list, so the chosen one is brought into view.
      document
        .getElementById(toOptionId(panelId, next))
        ?.scrollIntoView({ block: "nearest" });
    },
    [activeIndex, options.length, panelId],
  );

  const handleClearRecents = useCallback(() => {
    // The button disappears with the list, so focus goes back to the field first.
    document.getElementById(toInputId(panelId))?.focus();
    localStorage.removeItem(RECENT_SEARCH_KEY);
    setRecents([]);
    setActiveIndex(-1);
  }, [panelId]);

  return (
    <SearchPanel
      panelId={panelId}
      value={value}
      activeIndex={activeIndex}
      isLoading={loading}
      isStale={isPending}
      hint={hint}
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
  );
}
