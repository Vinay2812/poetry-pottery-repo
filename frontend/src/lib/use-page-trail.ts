"use client";

import { useLayoutEffect, useRef, useState } from "react";

import type { OperationVariables, TypedDocumentNode } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";

import {
  abandonPage,
  dropTrail,
  joinPages,
  type PagedList,
  type PageTrails,
  settlePage,
  startPage,
  toNextPageNumber,
  toPageTrail,
} from "./page-trail";

export interface PageTrailOptions<
  Data,
  Variables extends OperationVariables,
  Page extends PagedList,
> {
  query: TypedDocumentNode<Data, Variables>;
  // Names the filters on screen; a page only ever joins the key that asked for it.
  filterKey: string;
  toVariables: (page: number) => Variables;
  toPage: (data: Data) => Page;
  // Page one as Apollo answered it for these filters, and its last answer for any filters.
  firstPage: Page | undefined;
  previousFirstPage: Page | undefined;
  // Page one for these filters has settled without failing, so a next page may be asked.
  canAskNextPage: boolean;
}

export interface PageTrailState<Page> {
  // Page one with every page joined after it.
  list: Page | undefined;
  // Apollo's previous answer with the pages its own filters joined, to bridge a filter change.
  previousList: Page | undefined;
  isNextPageLoading: boolean;
  hasNextPageFailed: boolean;
  loadMore: () => void;
  // Page one is read again, so the pages after it start again from the fresh answer.
  restart: () => void;
}

// "Show more" for a list whose page one comes from useQuery. Each next page is fetched on its own
// and kept in this hook's state per filter key, never in Apollo's cache: a page that lands after
// the filters moved on is dropped, and with no-cache it cannot rewrite a card already on screen.
export function usePageTrail<
  Data,
  Variables extends OperationVariables,
  Page extends PagedList,
>({
  query,
  filterKey,
  toVariables,
  toPage,
  firstPage,
  previousFirstPage,
  canAskNextPage,
}: PageTrailOptions<Data, Variables, Page>): PageTrailState<Page> {
  const client = useApolloClient();
  const [trails, setTrails] = useState<PageTrails<Page>>({});
  // Recorded at once, so a second press in the same frame sees the first before any re-render.
  const inFlight = useRef(new Set<string>());
  // Apollo moves to new variables during render; this key follows at commit, before any page lands.
  const latestKey = useRef(filterKey);
  useLayoutEffect(() => {
    latestKey.current = filterKey;
  }, [filterKey]);
  // Apollo's previous answer belongs to the last filters that had one, so it keeps their pages too.
  const [answeredKey, setAnsweredKey] = useState(filterKey);
  if (firstPage !== undefined && answeredKey !== filterKey) {
    setAnsweredKey(filterKey);
  }

  const trail = toPageTrail(trails, filterKey);

  // Plain functions: the React Compiler memoizes them, and the callers' option callbacks are inline.
  const loadMore = () => {
    const page = toNextPageNumber(firstPage, toPageTrail(trails, filterKey));
    if (!canAskNextPage || page === null) return;
    const key = filterKey;
    const requestId = `${key}#${page}`;
    if (inFlight.current.has(requestId)) return;
    inFlight.current.add(requestId);
    setTrails((all) => startPage(all, key, page));
    client
      .query({
        query,
        variables: toVariables(page),
        fetchPolicy: "no-cache",
      })
      .then(
        ({ data }) => (data ? toPage(data) : null),
        () => null,
      )
      // Only the list still on screen takes the page; one that lands under other filters is let go.
      .then((answer) =>
        setTrails((all) =>
          latestKey.current === key
            ? settlePage(all, key, page, answer)
            : abandonPage(all, key, page),
        ),
      )
      .finally(() => inFlight.current.delete(requestId));
  };

  const restart = () => {
    setTrails((all) => dropTrail(all, filterKey));
  };

  return {
    list: joinPages(firstPage, trail),
    previousList: joinPages(
      previousFirstPage,
      toPageTrail(trails, answeredKey),
    ),
    isNextPageLoading: trail.next?.status === "loading",
    hasNextPageFailed: trail.next?.status === "failed",
    loadMore,
    restart,
  };
}
