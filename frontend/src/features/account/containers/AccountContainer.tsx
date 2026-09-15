"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { UserRole } from "@/graphql/generated/graphql";

import { AccountMenu } from "@/features/account/components/AccountMenu";
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
        <div className="h-16 animate-pulse rounded-full bg-primary-light" />
      </div>
    );
  }
  if (!isSignedIn || !user) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center md:px-8">
        <p className="font-script text-3xl text-clay-dark italic">
          Sign in to see your account
        </p>
        <button
          type="button"
          onClick={() => openSignIn()}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Sign in
        </button>
      </div>
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
