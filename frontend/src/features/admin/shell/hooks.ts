"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

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

/**
 * URL-driven list state. The address bar stays the source of truth; the optimistic
 * layer only covers the navigation so filters never lag behind a click.
 */
export function useAdminQueryState(): AdminQueryState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValues = useMemo(
    () => readQueryValues(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [values, addOptimisticPatch] = useOptimistic(
    urlValues,
    applyQueryPatch,
  );
  const [isPending, startTransition] = useTransition();
  // Rapid clicks stack on each other; the URL takes over again once they settle.
  const pendingRef = useRef(urlValues);
  useEffect(() => {
    if (!isPending) pendingRef.current = urlValues;
  }, [isPending, urlValues]);

  const patch = useCallback(
    (next: QueryPatch) => {
      const merged = applyQueryPatch(pendingRef.current, next);
      pendingRef.current = merged;
      const query = toQueryString(merged);
      startTransition(() => {
        addOptimisticPatch(next);
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [addOptimisticPatch, pathname, router],
  );

  return { values, page: readPage(values), isPending, patch };
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

/** Turns an unknown thrown value into something worth putting in a toast. */
export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}
