import { useCallback, useRef } from "react";

// Radix only returns focus to a Trigger; these dialogs open from outside one, so the opener is
// remembered on open and focused again on close instead of focus falling to the body.
export function useRestoreFocus() {
  const openerRef = useRef<HTMLElement | null>(null);
  const onOpenAutoFocus = useCallback(() => {
    const opener = document.activeElement;
    openerRef.current = opener instanceof HTMLElement ? opener : null;
  }, []);
  const onCloseAutoFocus = useCallback((event: Event) => {
    if (!openerRef.current?.isConnected) return;
    event.preventDefault();
    openerRef.current.focus();
  }, []);
  return { onOpenAutoFocus, onCloseAutoFocus };
}
