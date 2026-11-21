export const RECENT_SEARCH_KEY = "poetry.recent-searches";
export const MAX_RECENT_SEARCHES = 5;
export const MIN_SUGGEST_LENGTH = 2;
// Long enough that a word typed at speed asks the API once, short enough to feel immediate.
export const SUGGEST_DEBOUNCE_MS = 200;

export function toSearchHref(term: string): string {
  return `/search?q=${encodeURIComponent(term.trim())}`;
}

// The list is a stack of the last five distinct terms, newest first.
export function addRecentSearch(current: string[], term: string): string[] {
  const value = term.trim().replace(/\s+/g, " ");
  if (value.length === 0) return current;
  const rest = current.filter(
    (entry) => entry.toLowerCase() !== value.toLowerCase(),
  );
  return [value, ...rest].slice(0, MAX_RECENT_SEARCHES);
}

// localStorage holds whatever a previous version or another tab wrote; only strings survive.
export function parseRecentSearches(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export interface SuggestOption {
  id: string;
  label: string;
  href: string;
}

export interface SuggestOptionLists {
  recents: SuggestOption[];
  pieces: SuggestOption[];
  events: SuggestOption[];
  workshops: SuggestOption[];
}

// One flat list in the order the panel paints it, so arrow keys walk what the eye sees.
export function toOptionOrder(lists: SuggestOptionLists): SuggestOption[] {
  return [
    ...lists.recents,
    ...lists.pieces,
    ...lists.events,
    ...lists.workshops,
  ];
}

// Arrow keys wrap at both ends; nothing highlighted counts as one before the first.
export function nextActiveIndex(
  current: number,
  count: number,
  step: 1 | -1,
): number {
  if (count === 0) return -1;
  if (current < 0) return step === 1 ? 0 : count - 1;
  return (current + step + count) % count;
}

export function toInputId(panelId: string): string {
  return `${panelId}-input`;
}

export function toOptionId(panelId: string, index: number): string {
  return `${panelId}-option-${index}`;
}

// Suggestions belong to the term they were asked for; until the field and the answer agree they are stale.
export function isSuggestPending(
  value: string,
  term: string,
  isLoading: boolean,
): boolean {
  return isLoading || value.trim() !== term;
}

// Stale suggestions stay painted but drop out of what arrow keys, Enter and clicks can reach.
export function toSelectableLists(
  lists: SuggestOptionLists,
  isPending: boolean,
): SuggestOptionLists {
  if (!isPending) return lists;
  return { recents: lists.recents, pieces: [], events: [], workshops: [] };
}

// Enough of a pasted run to recognise it, short enough that the hint never pushes the row wide.
const HINT_EXCERPT_LENGTH = 32;

function toExcerpt(text: string): string {
  return text.length > HINT_EXCERPT_LENGTH
    ? `${text.slice(0, HINT_EXCERPT_LENGTH)}…`
    : text;
}

const SEARCH_SHELF_LINE = "Press Enter to search the shelf.";

export interface SearchHintInput {
  value: string;
  isPending: boolean;
  isError: boolean;
  resultCount: number;
}

// The line under the list says what the panel is doing, so an empty list never looks broken.
export function toSearchHint({
  value,
  isPending,
  isError,
  resultCount,
}: SearchHintInput): string {
  const typed = value.trim();
  if (typed.length === 0) {
    return "Type a glaze, a clay body or what you want to use it for.";
  }
  // Enter opens the piece search, so every hint names the shelf rather than promising everything.
  if (typed.length < MIN_SUGGEST_LENGTH) return SEARCH_SHELF_LINE;
  if (isPending) return "Looking…";
  if (isError) return `Suggestions did not load. ${SEARCH_SHELF_LINE}`;
  if (resultCount > 0) return SEARCH_SHELF_LINE;
  return `No suggestions for “${toExcerpt(typed)}”. ${SEARCH_SHELF_LINE}`;
}
