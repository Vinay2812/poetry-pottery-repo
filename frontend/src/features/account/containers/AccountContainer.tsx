"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { UserRole } from "@/graphql/generated/graphql";

import { PageShell } from "@/components/layout/PageShell";

import { AccountMenu } from "@/features/account/components/AccountMenu";
import { SignInWall } from "@/features/auth/components/SignInWall";
import { toDisplayName, toMemberSince } from "@/features/account/types";

export function AccountContainer() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { openUserProfile, signOut, openSignIn } = useClerk();
  const router = useRouter();

  const [, startTransition] = useTransition();

  // The push is a transition so the page it lands on can stream in rather than blocking.
  const handleSignOut = useCallback(() => {
    void signOut(() => startTransition(() => router.push("/")));
  }, [router, signOut]);

  if (!isLoaded) {
    return (
      <PageShell column="narrow" className="py-8 md:py-12" isBusy>
        <div className="h-16 animate-pulse bg-ash" />
      </PageShell>
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
      imageUrl={user.hasImage ? user.imageUrl : null}
      memberSince={toMemberSince(user.createdAt)}
      isAdmin={user.publicMetadata.role === UserRole.Admin}
      onManageProfile={() => openUserProfile()}
      onSignOut={handleSignOut}
    />
  );
}
