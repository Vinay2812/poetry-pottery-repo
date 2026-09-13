"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { UserRole } from "@/graphql/generated/graphql";

import { AccountMenu } from "@/features/account/components/AccountMenu";
import { SignInWall } from "@/features/auth/components/SignInWall";
import { toDisplayName, toMemberSince } from "@/features/account/types";

export function AccountContainer() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile, signOut, openSignIn } = useClerk();
  const router = useRouter();

  const handleSignOut = useCallback(() => {
    void signOut(() => router.push("/"));
  }, [router, signOut]);

  if (!isLoaded) {
    return (
      <div
        className="mx-auto w-full max-w-3xl px-4 py-10 md:px-8"
        aria-busy="true"
      >
        <div className="h-16 animate-pulse bg-ash" />
      </div>
    );
  }
  if (!isSignedIn || !user) {
    return (
      <SignInWall
        message="Sign in to see your account"
        onSignIn={() => openSignIn()}
      />
    );
  }
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  return (
    <AccountMenu
      displayName={toDisplayName(user.fullName, email)}
      email={email}
      imageUrl={user.imageUrl}
      memberSince={toMemberSince(user.createdAt)}
      isAdmin={user.publicMetadata.role === UserRole.Admin}
      onManageProfile={() => openUserProfile()}
      onSignOut={handleSignOut}
    />
  );
}
