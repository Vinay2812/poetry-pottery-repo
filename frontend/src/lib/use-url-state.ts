"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useTransition,
} from "react";

// How one list's state lives in the address bar. Keep codecs at module scope so they stay stable.
export interface UrlCodec<T, A> {
  parse: (search: URLSearchParams) => T;
  // The query string without its "?"; empty means the bare path.
  serialize: (value: T) => string;
  // Folds one change into a value; also the optimistic reducer.
  apply: (value: T, action: A) => T;
}

interface DispatchOptions {
  // "push" leaves a history entry so Back returns to the previous value; the default replaces it.
  history?: "push" | "replace";
}

export interface UrlState<T, A> {
  value: T;
  isPending: boolean;
  dispatch: (action: A, options?: DispatchOptions) => void;
  toHref: (value: T) => string;
}

// The URL stays the source of truth; the optimistic layer only covers the navigation, so the
// previous results stay on screen and a control never lags behind a click.
export function useUrlState<T, A>(codec: UrlCodec<T, A>): UrlState<T, A> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = useMemo(
    () => codec.parse(new URLSearchParams(searchParams.toString())),
    [codec, searchParams],
  );
  const [value, addOptimisticAction] = useOptimistic(urlValue, codec.apply);
  const [isPending, startTransition] = useTransition();
  // Rapid clicks stack on each other; the URL takes over again once the navigations settle.
  const pendingRef = useRef(urlValue);
  useEffect(() => {
    if (!isPending) pendingRef.current = urlValue;
  }, [isPending, urlValue]);

  const toHref = useCallback(
    (next: T) => {
      const query = codec.serialize(next);
      return query ? `${pathname}?${query}` : pathname;
    },
    [codec, pathname],
  );

  const dispatch = useCallback(
    (action: A, options?: DispatchOptions) => {
      const next = codec.apply(pendingRef.current, action);
      pendingRef.current = next;
      const navigate =
        options?.history === "push" ? router.push : router.replace;
      startTransition(() => {
        addOptimisticAction(action);
        navigate(toHref(next), { scroll: false });
      });
    },
    [addOptimisticAction, codec, router, toHref],
  );

  return { value, isPending, dispatch, toHref };
}
