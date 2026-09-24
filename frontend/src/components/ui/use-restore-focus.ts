"use client";

import { useCallback, useRef } from "react";

type AutoFocusHandler = (event: Event) => void;

// Radix only returns focus to a Trigger; most of our dialogs open without one, so the opener is
// remembered on open and focused again on close. A caller that prevents the close keeps control.
export function useRestoreFocus(
  onOpenAutoFocus: AutoFocusHandler | undefined,
  onCloseAutoFocus: AutoFocusHandler | undefined,
) {
  const openerRef = useRef<HTMLElement | null>(null);

  const handleOpenAutoFocus = useCallback(
    (event: Event) => {
      const opener = document.activeElement;
      openerRef.current =
        opener instanceof HTMLElement && opener !== document.body
          ? opener
          : null;
      onOpenAutoFocus?.(event);
    },
    [onOpenAutoFocus],
  );

  const handleCloseAutoFocus = useCallback(
    (event: Event) => {
      onCloseAutoFocus?.(event);
      const opener = openerRef.current;
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
