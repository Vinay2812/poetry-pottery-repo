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

export function toOptionId(panelId: string, index: number): string {
  return `${panelId}-option-${index}`;
}

export interface SearchHintInput {
  value: string;
  term: string;
  isLoading: boolean;
  resultCount: number;
}

// The line under the list says what the panel is doing, so an empty list never looks broken.
export function toSearchHint({
  value,
  term,
  isLoading,
  resultCount,
}: SearchHintInput): string {
  const typed = value.trim();
  if (typed.length === 0) {
    return "Type a glaze, a clay body or what you want to use it for.";
  }
  if (resultCount > 0 || typed.length < MIN_SUGGEST_LENGTH) {
    return "Press Enter to search everything.";
  }
  // Until the debounced term catches up with the field, the answer is still on its way.
  if (isLoading || term !== typed) return "Looking…";
  return `Nothing matches “${typed}”. Try a glaze, a clay body or a shape.`;
}
