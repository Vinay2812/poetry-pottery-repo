"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { UserRole } from "@/graphql/generated/graphql";

import { useCartCount } from "@/features/cart/hooks";
import { SiteHeader } from "@/features/layout/components/SiteHeader";
import { isActivePath, NAV_LINKS } from "@/features/layout/types";
import { useWishlistIds } from "@/features/wishlist/hooks";

export function SiteHeaderContainer() {
  const cartCount = useCartCount();
  const { count: wishlistCount } = useWishlistIds();
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();

  const activeHref = useMemo(
    () =>
      NAV_LINKS.find((link) => isActivePath(pathname, link.href))?.href ?? null,
    [pathname],
  );

  const handleSearchClick = useCallback(() => {
    router.push("/search");
  }, [router]);

  const handleAccountClick = useCallback(() => {
    if (isSignedIn) {
      router.push("/account");
    } else {
      openSignIn();
    }
  }, [isSignedIn, openSignIn, router]);

  return (
    <SiteHeader
      navLinks={NAV_LINKS}
      activeHref={activeHref}
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      isSignedIn={Boolean(isSignedIn)}
      isAdmin={user?.publicMetadata.role === UserRole.Admin}
      userImageUrl={user?.imageUrl ?? null}
      isHome={pathname === "/"}
      onSearchClick={handleSearchClick}
      onAccountClick={handleAccountClick}
    />
  );
}
