"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";

import { UserRole } from "@/graphql/generated/graphql";

import { useCartCount } from "@/features/cart/hooks";
import { SiteHeader } from "@/features/layout/components/SiteHeader";
import { MobileMenuContainer } from "@/features/layout/containers/MobileMenuContainer";
import {
  isActivePath,
  NAV_LINKS,
  toFocusedHeader,
} from "@/features/layout/types";
import { SearchMenuContainer } from "@/features/search";
import { useWishlistIds } from "@/features/wishlist/hooks";

export function SiteHeaderContainer() {
  const cartCount = useCartCount();
  const { count: wishlistCount } = useWishlistIds();
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { openSignIn, signOut } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activeHref = useMemo(
    () =>
      NAV_LINKS.find((link) => isActivePath(pathname, link.href))?.href ?? null,
    [pathname],
  );
  // Buying pages keep the wordmark and one way back, nothing else to wander into.
  const focused = toFocusedHeader(pathname);
  const handleSearchClick = useCallback(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(true);
  }, []);
  const handleCloseSearch = useCallback(() => setIsSearchOpen(false), []);

  const handleAccountClick = useCallback(() => {
    setIsMenuOpen(false);
    if (isSignedIn) {
      router.push("/account");
    } else {
      openSignIn();
    }
  }, [isSignedIn, openSignIn, router]);

  const handleSignOut = useCallback(() => {
    setIsMenuOpen(false);
    void signOut();
  }, [signOut]);

  const handleCloseMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <>
      <SiteHeader
        navLinks={NAV_LINKS}
        activeHref={activeHref}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        isSignedIn={Boolean(isSignedIn)}
        isAdmin={user?.publicMetadata.role === UserRole.Admin}
        userImageUrl={user?.hasImage ? user.imageUrl : null}
        isHome={pathname === "/"}
        variant={focused ? "focused" : "full"}
        backHref={focused?.href ?? null}
        backLabel={focused?.label ?? null}
        isSearchOpen={isSearchOpen}
        onSearchClick={handleSearchClick}
        onAccountClick={handleAccountClick}
        onMenuClick={() => setIsMenuOpen(true)}
      />
      <SearchMenuContainer isOpen={isSearchOpen} onClose={handleCloseSearch} />
      <Suspense>
        <MobileMenuContainer
          isOpen={isMenuOpen}
          isSignedIn={Boolean(isSignedIn)}
          wishlistCount={wishlistCount}
          onOpenChange={setIsMenuOpen}
          onNavigate={handleCloseMenu}
          onAccountClick={handleAccountClick}
          onSignOut={handleSignOut}
        />
      </Suspense>
    </>
  );
}
