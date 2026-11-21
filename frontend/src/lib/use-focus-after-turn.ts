import { type RefObject, useCallback, useEffect, useRef } from "react";

export interface FocusAfterTurn<T extends HTMLElement> {
  // Goes on the list heading, which needs tabIndex={-1}.
  headingRef: RefObject<T | null>;
  // Call when a page is asked for; scrolls to the heading now and focuses it once the page lands.
  startTurn: () => void;
}

// After a page turn the pager that was clicked may be gone or disabled, so focus would fall to <body>.
// Focus goes to the list heading once the new rows are in; a turn that fails leaves focus where it is.
export function useFocusAfterTurn<T extends HTMLElement>(
  isSettled: boolean,
  shownPage: number,
  failedPage: number | null,
): FocusAfterTurn<T> {
  const headingRef = useRef<T>(null);
  const isTurningRef = useRef(false);

  useEffect(() => {
    if (!isTurningRef.current || !isSettled) return;
    isTurningRef.current = false;
    if (failedPage === null) headingRef.current?.focus({ preventScroll: true });
  }, [isSettled, shownPage, failedPage]);

  const startTurn = useCallback(() => {
    isTurningRef.current = true;
    headingRef.current?.scrollIntoView({ block: "start" });
  }, []);

  return { headingRef, startTurn };
}
