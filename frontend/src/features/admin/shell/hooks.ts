"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { type UrlCodec, useUrlState } from "@/lib/use-url-state";

import {
  applyQueryPatch,
  isBackFromGuard,
  isBackGuardState,
  toBackGuardState,
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

export interface AdminLeaveGuard {
  onLeaveAttempt: (href: string) => void;
}

// The chrome holds at most one guard, set by whichever editor is dirty.
export const AdminLeaveGuardContext = createContext<
  (guard: AdminLeaveGuard | null) => void
>(() => {});

/** While an editor has unsaved work, the admin nav hands its clicks here instead of leaving. */
export function useAdminLeaveGuard(
  onLeaveAttempt: ((href: string) => void) | null,
): void {
  const setGuard = useContext(AdminLeaveGuardContext);
  useEffect(() => {
    if (onLeaveAttempt === null) return;
    setGuard({ onLeaveAttempt });
    return () => setGuard(null);
  }, [onLeaveAttempt, setGuard]);
}

export interface BackGuard {
  // Goes where Back was headed, once the editor has said yes: past the restored spare entry and this page.
  leaveBack: () => void;
  // Goes to a link, replacing the spare entry so history keeps one copy of this page.
  leaveTo: (href: string) => void;
  // Makes sure the spare entry is on top, e.g. after "Keep editing".
  stay: () => void;
}

/**
 * While an editor has unsaved work, a spare history entry for this same page sits on top,
 * so browser Back stays here and asks first. The spare goes back on before asking, so a second
 * Back while the dialog is open asks again instead of leaving. Uses only window.history, which Next keeps in step.
 */
export function useBackGuard(onBackAttempt: (() => void) | null): BackGuard {
  const router = useRouter();
  const isDirty = onBackAttempt !== null;
  const onBackRef = useRef(onBackAttempt);
  const isOnGuardRef = useRef(false);
  const guardedHrefRef = useRef<string | null>(null);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    onBackRef.current = onBackAttempt;
  }, [onBackAttempt]);

  const pushGuard = useCallback(() => {
    guardedHrefRef.current = window.location.href;
    window.history.pushState(toBackGuardState(), "", window.location.href);
    isOnGuardRef.current = true;
  }, []);

  const stay = useCallback(() => {
    if (isLeavingRef.current || isBackGuardState(window.history.state)) return;
    pushGuard();
  }, [pushGuard]);

  useEffect(() => {
    if (isDirty) stay();
  }, [isDirty, stay]);

  useEffect(() => {
    // A reload or a Forward can land straight on a spare entry left earlier.
    isOnGuardRef.current = isBackGuardState(window.history.state);
    if (isOnGuardRef.current) guardedHrefRef.current = window.location.href;
    const handlePopState = () => {
      const wasOnGuard = isOnGuardRef.current;
      isOnGuardRef.current = isBackGuardState(window.history.state);
      const isGuardedBack = isBackFromGuard(
        wasOnGuard,
        isOnGuardRef.current,
        window.location.href,
        guardedHrefRef.current,
      );
      if (!isGuardedBack || isLeavingRef.current) return;
      const onBack = onBackRef.current;
      // Saved since the entry went in, so Back carries on past this page's duplicate.
      if (onBack === null) {
        window.history.back();
        return;
      }
      pushGuard();
      onBack();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pushGuard]);

  const leaveBack = useCallback(() => {
    isLeavingRef.current = true;
    window.history.go(isBackGuardState(window.history.state) ? -2 : -1);
  }, []);

  const leaveTo = useCallback(
    (href: string) => {
      isLeavingRef.current = true;
      if (isBackGuardState(window.history.state)) router.replace(href);
      else router.push(href);
    },
    [router],
  );

  return { leaveBack, leaveTo, stay };
}
