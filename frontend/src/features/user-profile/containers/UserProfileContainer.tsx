"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback } from "react";

import { UserRole } from "@/graphql/generated/graphql";
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
  const { isLoaded, isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  const isSignInPromptOpen = useUIStore((state) => state.isSignInPromptOpen);
  const openSignInPrompt = useUIStore((state) => state.openSignInPrompt);
  const closeSignInPrompt = useUIStore((state) => state.closeSignInPrompt);

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const displayName = user ? toDisplayName(user.fullName, email) : "";
  const role = user?.publicMetadata.role;

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
        isLoading={!isLoaded}
        isSignedIn={Boolean(isSignedIn)}
        hasError={false}
        displayName={displayName}
        initial={toInitial(displayName)}
        email={email}
        roleLabel={user ? toRoleLabel(role) : ""}
        isAdmin={role === UserRole.Admin}
        memberSince={user ? toMemberSince(user.createdAt) : ""}
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
