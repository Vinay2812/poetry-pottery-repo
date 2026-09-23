import type { ContentPageQuery } from "@/graphql/generated/graphql";

export type ContentSectionData =
  ContentPageQuery["contentPage"]["sections"][number];
export type ContentItemData = ContentSectionData["items"][number];

export interface ContentSectionView {
  id: string;
  heading: string;
  paragraphs: string[];
  items: ContentItemData[];
}

// Browsers word a dropped connection differently: Chrome, Firefox and Safari in that order.
const OFFLINE_PATTERN = /failed to fetch|networkerror|load failed/i;
const THROTTLED_PATTERN = /too many requests/i;

export const OFFLINE_MESSAGE =
  "We could not reach the studio. Check your connection and try again.";
export const THROTTLED_MESSAGE =
  "That was a lot of tries in a row. Wait a minute and try again.";

// Nest prefixes its errors ("ThrottlerException: ..."); the visitor only needs the sentence,
// and transport failures get words a visitor can act on.
export function toServerMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.replace(/^\w*(Exception|Error):\s*/, "").trim();
  if (OFFLINE_PATTERN.test(message)) return OFFLINE_MESSAGE;
  if (THROTTLED_PATTERN.test(message)) return THROTTLED_MESSAGE;
  return message.length > 0 ? message : fallback;
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
      items: section.items,
    };
  });
}

export function sectionAt(
  sections: readonly ContentSectionData[],
  index: number,
): ContentSectionData | null {
  return sections[index] ?? null;
}
