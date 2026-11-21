import type { UrlCodec } from "@/lib/use-url-state";

export interface PageTurn {
  // The page whose rows are on screen, which is what the pager names.
  shownPage: number;
  // A page that was asked for but failed to replace them, so it can be asked for again.
  failedPage: number | null;
}

// While a page loads the pager already names it; once it fails, the pager steps back to the rows still shown.
export function toPageTurn(
  requestedPage: number,
  resultPage: number | null,
  hasError: boolean,
): PageTurn {
  if (hasError && resultPage !== null && resultPage !== requestedPage) {
    return { shownPage: resultPage, failedPage: requestedPage };
  }
  return { shownPage: requestedPage, failedPage: null };
}

// Anything that is not a whole page number past the first means the first page.
export function toPageNumber(raw: string | null): number {
  const page = Number(raw);
  return Number.isInteger(page) && page > 1 ? page : 1;
}

// A list keeps its page in the address bar, so a refresh, Back or a shared link opens the same page.
export const PAGE_CODEC: UrlCodec<number, number> = {
  parse: (search) => toPageNumber(search.get("page")),
  serialize: (page) => (page > 1 ? `page=${page}` : ""),
  apply: (_current, next) => next,
};
