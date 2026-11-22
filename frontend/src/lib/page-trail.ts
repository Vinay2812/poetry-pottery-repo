// "Show more" lists keep their later pages here, in React state, rather than written into Apollo's
// cache. Apollo fetches the first page through the list's query and each later page on its own;
// the trail joins them per filter key, so a page only ever joins the list that asked for it.

export interface PagedList {
  items: unknown[];
  page_info: { page: number; has_more: boolean };
}

export interface PageTrail<Page> {
  // Pages after the first that have joined the list, in order.
  pages: Page[];
  // The page asked for next: still out, or failed and waiting for a retry.
  next: { page: number; status: "loading" | "failed" } | null;
}

export type PageTrails<Page> = Record<string, PageTrail<Page>>;

const EMPTY_TRAIL: PageTrail<never> = { pages: [], next: null };

export function toPageTrail<Page>(
  trails: PageTrails<Page>,
  key: string,
): PageTrail<Page> {
  return trails[key] ?? EMPTY_TRAIL;
}

// The page that follows what the list shows, or null when there is none to ask for.
export function toNextPageNumber<Page extends PagedList>(
  first: Page | undefined,
  trail: PageTrail<Page>,
): number | null {
  const last = trail.pages.at(-1) ?? first;
  return last?.page_info.has_more ? last.page_info.page + 1 : null;
}

export function startPage<Page>(
  trails: PageTrails<Page>,
  key: string,
  page: number,
): PageTrails<Page> {
  const trail = toPageTrail(trails, key);
  return {
    ...trails,
    [key]: { pages: trail.pages, next: { page, status: "loading" } },
  };
}

// Records how a page request ended. An answer the key is no longer waiting on changes nothing,
// so a repeated or late page never joins twice; a failure is kept so it can be asked again.
export function settlePage<Page>(
  trails: PageTrails<Page>,
  key: string,
  page: number,
  answer: Page | null,
): PageTrails<Page> {
  const trail = trails[key];
  if (trail?.next?.page !== page || trail.next.status !== "loading") {
    return trails;
  }
  const settled: PageTrail<Page> = answer
    ? { pages: [...trail.pages, answer], next: null }
    : { pages: trail.pages, next: { page, status: "failed" } };
  return { ...trails, [key]: settled };
}

// A page that lands after the list moved to other filters is let go: the list it was for is no
// longer on screen, so its request simply ends and that list can ask again when it comes back.
export function abandonPage<Page>(
  trails: PageTrails<Page>,
  key: string,
  page: number,
): PageTrails<Page> {
  const trail = trails[key];
  if (trail?.next?.page !== page) return trails;
  return { ...trails, [key]: { pages: trail.pages, next: null } };
}

// The first page reloaded, so the pages that followed it start again from it.
export function dropTrail<Page>(
  trails: PageTrails<Page>,
  key: string,
): PageTrails<Page> {
  if (!(key in trails)) return trails;
  return Object.fromEntries(
    Object.entries(trails).filter(([other]) => other !== key),
  );
}

// The first page with every joined page after it; the newest page's page_info says what is left.
export function joinPages<Page extends PagedList>(
  first: Page | undefined,
  trail: PageTrail<Page>,
): Page | undefined {
  const last = trail.pages.at(-1);
  if (!first || !last) return first;
  return {
    ...first,
    items: [first.items, ...trail.pages.map((page) => page.items)].flat(),
    page_info: last.page_info,
  };
}
