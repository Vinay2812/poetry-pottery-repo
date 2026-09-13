"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { MobileMenuSheet } from "@/features/layout/components/MobileMenuSheet";
import { isActiveLink, MOBILE_MENU_LINKS } from "@/features/layout/types";

export interface MobileMenuContainerProps {
  isOpen: boolean;
  isSignedIn: boolean;
  wishlistCount: number;
  onOpenChange: (isOpen: boolean) => void;
  onNavigate: () => void;
  onAccountClick: () => void;
  onSignOut: () => void;
}

// Split out of the header so the search params it reads sit behind their own Suspense boundary.
export function MobileMenuContainer({
  isOpen,
  isSignedIn,
  wishlistCount,
  onOpenChange,
  onNavigate,
  onAccountClick,
  onSignOut,
}: MobileMenuContainerProps) {
  const pathname = usePathname();
  const view = useSearchParams().get("view");
  const activeHref = useMemo(
    () =>
      MOBILE_MENU_LINKS.find((link) => isActiveLink(pathname, view, link.href))
        ?.href ?? null,
    [pathname, view],
  );

  return (
    <MobileMenuSheet
      isOpen={isOpen}
      links={MOBILE_MENU_LINKS}
      activeHref={activeHref}
      isSignedIn={isSignedIn}
      wishlistCount={wishlistCount}
      onOpenChange={onOpenChange}
      onNavigate={onNavigate}
      onAccountClick={onAccountClick}
      onSignOut={onSignOut}
    />
  );
}
