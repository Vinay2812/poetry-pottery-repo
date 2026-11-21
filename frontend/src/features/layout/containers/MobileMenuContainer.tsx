"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { MobileMenuSheet } from "@/features/layout/components/MobileMenuSheet";
import { isActivePath, MOBILE_MENU_LINKS } from "@/features/layout/types";

export interface MobileMenuContainerProps {
  isOpen: boolean;
  isSignedIn: boolean;
  wishlistCount: number;
  contactPhone: string;
  whatsappUrl: string | null;
  onOpenChange: (isOpen: boolean) => void;
  onNavigate: () => void;
  onAccountClick: () => void;
  onSignOut: () => void;
}

export function MobileMenuContainer({
  isOpen,
  isSignedIn,
  wishlistCount,
  contactPhone,
  whatsappUrl,
  onOpenChange,
  onNavigate,
  onAccountClick,
  onSignOut,
}: MobileMenuContainerProps) {
  const pathname = usePathname();
  const activeHref = useMemo(
    () =>
      MOBILE_MENU_LINKS.find((link) => isActivePath(pathname, link.href))
        ?.href ?? null,
    [pathname],
  );

  return (
    <MobileMenuSheet
      isOpen={isOpen}
      links={MOBILE_MENU_LINKS}
      activeHref={activeHref}
      isSignedIn={isSignedIn}
      wishlistCount={wishlistCount}
      contactPhone={contactPhone}
      whatsappUrl={whatsappUrl}
      onOpenChange={onOpenChange}
      onNavigate={onNavigate}
      onAccountClick={onAccountClick}
      onSignOut={onSignOut}
    />
  );
}
