"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useCallback, useEffect } from "react";

import { UserRole, useMeQuery } from "@/graphql/generated/graphql";
import { logger } from "@/lib/logger";
import { useUIStore } from "@/store/ui-store";

import { SignInPromptDialog } from "@/features/user-profile/components/SignInPromptDialog";
import { UserProfile } from "@/features/user-profile/components/UserProfile";
import {
  toDisplayName,
  toInitial,
  toMemberSince,
  toRoleLabel,
} from "@/features/user-profile/types";

export function UserProfileContainer() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const isSignInPromptOpen = useUIStore((state) => state.isSignInPromptOpen);
  const openSignInPrompt = useUIStore((state) => state.openSignInPrompt);
  const closeSignInPrompt = useUIStore((state) => state.closeSignInPrompt);
  const showToast = useUIStore((state) => state.showToast);

  const { data, loading, error } = useMeQuery({
    skip: !isLoaded || !isSignedIn,
  });

  useEffect(() => {
    if (!error) return;
    logger.warn("Failed to load the current user", { message: error.message });
    showToast("We could not load your profile.");
  }, [error, showToast]);

  const user = data?.me ?? null;
  const displayName = user ? toDisplayName(user) : "";

  const handleSignInClick = useCallback(() => {
    openSignInPrompt();
  }, [openSignInPrompt]);

  const handlePromptOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) closeSignInPrompt();
    },
    [closeSignInPrompt],
  );

  const handlePromptConfirm = useCallback(() => {
    closeSignInPrompt();
    openSignIn();
  }, [closeSignInPrompt, openSignIn]);

  return (
    <>
      <UserProfile
        isLoading={!isLoaded || loading}
        isSignedIn={Boolean(isSignedIn)}
        hasError={Boolean(error)}
        displayName={displayName}
        initial={toInitial(displayName)}
        email={user?.email ?? ""}
        roleLabel={user ? toRoleLabel(user.role) : ""}
        isAdmin={user?.role === UserRole.Admin}
        memberSince={user ? toMemberSince(user.created_at) : ""}
        onSignInClick={handleSignInClick}
      />
      <SignInPromptDialog
        isOpen={isSignInPromptOpen}
        onOpenChange={handlePromptOpenChange}
        onConfirm={handlePromptConfirm}
      />
    </>
  );
}
