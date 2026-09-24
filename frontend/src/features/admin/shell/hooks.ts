"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { type UrlCodec, useUrlState } from "@/lib/use-url-state";

import {
  applyQueryPatch,
  type QueryPatch,
  type QueryValues,
  readPage,
  readQueryValues,
  toQueryString,
} from "./types";

export interface AdminQueryState {
  values: QueryValues;
  page: number;
  isPending: boolean;
  patch: (next: QueryPatch) => void;
}

const ADMIN_QUERY_CODEC: UrlCodec<QueryValues, QueryPatch> = {
  parse: readQueryValues,
  serialize: toQueryString,
  apply: applyQueryPatch,
};

// Every console list keeps its filters, search and page in the URL.
export function useAdminQueryState(): AdminQueryState {
  const { value, isPending, dispatch } = useUrlState(ADMIN_QUERY_CODEC);
  return { values: value, page: readPage(value), isPending, patch: dispatch };
}

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Typing updates the field at once and the URL after a short pause, so the
 * caret never jumps while a slower query catches up.
 */
export function useSearchDraft(
  committed: string,
  onCommit: (value: string) => void,
): [string, (value: string) => void] {
  const [draft, setDraft] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedRef = useRef(committed);

  // A filter change elsewhere can clear the search; the field follows the URL again.
  useEffect(() => {
    if (committedRef.current !== committed) {
      committedRef.current = committed;
      setDraft(null);
    }
  }, [committed]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const change = useCallback(
    (value: string) => {
      setDraft(value);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        committedRef.current = value;
        onCommit(value);
      }, SEARCH_DEBOUNCE_MS);
    },
    [onCommit],
  );

  return [draft ?? committed, change];
}
