"use client";

import { useCallback, useEffect, useRef } from "react";

type AutoFocusHandler = (event: Event) => void;

let lastFocusOutsideDialogs: HTMLElement | null = null;
let isTracking = false;

// Radix skips its open event when an autoFocus field already holds focus, so the last element
// focused outside any dialog stands in for the opener.
function trackFocusOutsideDialogs(): void {
  if (isTracking) return;
  isTracking = true;
  document.addEventListener(
    "focusin",
    (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && !target.closest('[role="dialog"]')) {
        lastFocusOutsideDialogs = target;
      }
    },
    true,
  );
}

function findOpener(event: Event): HTMLElement | null {
  const content =
    event.currentTarget instanceof Node ? event.currentTarget : null;
  const active = document.activeElement;
  if (
    active instanceof HTMLElement &&
    active !== document.body &&
    !content?.contains(active)
  ) {
    return active;
  }
  return lastFocusOutsideDialogs;
}

// Radix only returns focus to a Trigger; most of our dialogs open without one, so the opener is
// remembered on open and focused again on close. A caller that prevents the close keeps control.
export function useRestoreFocus(
  onOpenAutoFocus: AutoFocusHandler | undefined,
  onCloseAutoFocus: AutoFocusHandler | undefined,
) {
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    trackFocusOutsideDialogs();
  }, []);

  const handleOpenAutoFocus = useCallback(
    (event: Event) => {
      openerRef.current = findOpener(event);
      onOpenAutoFocus?.(event);
    },
    [onOpenAutoFocus],
  );

  const handleCloseAutoFocus = useCallback(
    (event: Event) => {
      onCloseAutoFocus?.(event);
      const opener = openerRef.current ?? lastFocusOutsideDialogs;
      openerRef.current = null;
      if (event.defaultPrevented || !opener?.isConnected) return;
      event.preventDefault();
      opener.focus();
    },
    [onCloseAutoFocus],
  );

  return {
    onOpenAutoFocus: handleOpenAutoFocus,
    onCloseAutoFocus: handleCloseAutoFocus,
  };
}
