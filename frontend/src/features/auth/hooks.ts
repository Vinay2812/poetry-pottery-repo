"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

import { useUIStore } from "@/store/ui-store";

// Wraps an action that needs an account: signed-out users get the prompt instead.
export function useRequireAuth(): (action: () => void) => void {
  const { isSignedIn } = useAuth();
  const openSignInPrompt = useUIStore((state) => state.openSignInPrompt);

  return useCallback(
    (action: () => void) => {
      if (isSignedIn) {
        action();
      } else {
        openSignInPrompt();
      }
    },
    [isSignedIn, openSignInPrompt],
  );
}
