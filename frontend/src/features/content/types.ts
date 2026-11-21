import type { ContentPageQuery } from "@/graphql/generated/graphql";

export type ContentSectionData =
  ContentPageQuery["contentPage"]["sections"][number];

export interface ContentItemView {
  title: string;
  paragraphs: string[];
}

export interface ContentSectionView {
  id: string;
  heading: string;
  paragraphs: string[];
  items: ContentItemView[];
}

// The thank-you shows optimistically, so the form never sits in a submitting state.
export type NewsletterState = "idle" | "subscribed" | "error";

export interface NewsletterResult {
  state: NewsletterState;
  message: string | null;
}

export const IDLE_NEWSLETTER: NewsletterResult = {
  state: "idle",
  message: null,
};

// The optimistic reducer is a straight swap: the pending answer replaces the current one.
export function applyNewsletterResult(
  _current: NewsletterResult,
  next: NewsletterResult,
): NewsletterResult {
  return next;
}

/** CMS bodies are plain text; a blank line starts a new paragraph. */
export function splitParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

export function toAnchorId(heading: string): string {
  const slug = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "section";
}

// Two sections can share a heading, so repeated anchors get a counter suffix.
export function toSectionViews(
  sections: readonly ContentSectionData[],
): ContentSectionView[] {
  const seen = new Map<string, number>();
  return sections.map((section) => {
    const base = toAnchorId(section.heading);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return {
      id: count > 1 ? `${base}-${count}` : base,
      heading: section.heading,
      paragraphs: splitParagraphs(section.body),
      items: section.items.map((item) => ({
        title: item.title,
        paragraphs: splitParagraphs(item.body),
      })),
    };
  });
}

export function sectionAt(
  sections: readonly ContentSectionData[],
  index: number,
): ContentSectionData | null {
  return sections[index] ?? null;
}

// One label-column width for the page index and the definition rows, so the two never drift apart.
export const ASIDE_COLUMNS = "md:grid-cols-[minmax(0,13.75rem)_1fr]";

// The on-this-page list earns its space only when there is somewhere to jump to.
export const MIN_INDEX_SECTIONS = 2;

export interface SectionPosition {
  id: string;
  top: number;
}

export interface ActiveSectionInput {
  sections: readonly SectionPosition[];
  readingLine: number;
  isAtBottom: boolean;
}

// Reads only where things are now, so nothing stale can stay lit: at the foot of the page the last
// section wins (it may never reach the line), else the last one whose top has passed the line, else the first.
export function pickActiveSection({
  sections,
  readingLine,
  isAtBottom,
}: ActiveSectionInput): string | null {
  if (isAtBottom) return sections.at(-1)?.id ?? null;
  const passed = sections.filter((section) => section.top <= readingLine);
  return (passed.at(-1) ?? sections[0])?.id ?? null;
}

export type GridColumns = 2 | 3 | 4;

// Rows of three or four, whichever leaves the last row least empty; ties go to four.
export function toGridColumns(count: number): GridColumns {
  if (count <= 2) return 2;
  const emptyCells = (columns: number) =>
    (columns - (count % columns)) % columns;
  return emptyCells(3) < emptyCells(4) ? 3 : 4;
}

// Literal class strings, so Tailwind can see every one of them.
const GRID_CLASSES: Record<GridColumns, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function toGridClass(count: number): string {
  return GRID_CLASSES[toGridColumns(count)];
}

export function toStepNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}
