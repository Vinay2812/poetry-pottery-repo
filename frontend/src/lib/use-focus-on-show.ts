import { type RefObject, useEffect, useRef } from "react";

// Moves focus to the element once `isShown` turns true, which also scrolls it into view.
// Use it where a form folds into a one-line confirmation, so the reader is not left in the footer.
export function useFocusOnShow<T extends HTMLElement>(
  isShown: boolean,
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (isShown) ref.current?.focus();
  }, [isShown]);

  return ref;
}
