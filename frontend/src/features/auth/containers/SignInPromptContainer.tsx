"use client";

import { useClerk } from "@clerk/nextjs";
import { useCallback } from "react";

import { useUIStore } from "@/store/ui-store";

import { SignInPromptDialog } from "@/features/auth/components/SignInPromptDialog";

export function SignInPromptContainer() {
  const isOpen = useUIStore((state) => state.isSignInPromptOpen);
  const close = useUIStore((state) => state.closeSignInPrompt);
  const { openSignIn } = useClerk();

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) close();
    },
    [close],
  );

  const handleConfirm = useCallback(() => {
    close();
    openSignIn();
  }, [close, openSignIn]);

  return (
    <SignInPromptDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      onConfirm={handleConfirm}
    />
  );
}
