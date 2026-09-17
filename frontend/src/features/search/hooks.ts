"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { SUGGEST_DEBOUNCE_MS } from "@/features/search/types";

// The field paints on every keystroke; the term suggestions are asked for only settles once
// typing pauses, so a word costs one request instead of one per letter.
export function useDebouncedTerm(
  value: string,
  delay = SUGGEST_DEBOUNCE_MS,
): string {
  const deferred = useDeferredValue(value).trim();
  const [term, setTerm] = useState(deferred);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(deferred), delay);
    return () => clearTimeout(timer);
  }, [deferred, delay]);

  return term;
}
