"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { useCartCount } from "@/features/cart/hooks";
import { MobileNav } from "@/features/layout/components/MobileNav";
import { isActivePath, isFocusedPath } from "@/features/layout/types";

const MOBILE_HREFS = ["/", "/products", "/workshops", "/cart"];

export function MobileNavContainer() {
  const cartCount = useCartCount();
  const pathname = usePathname();
  const activeHref = useMemo(
    () => MOBILE_HREFS.find((href) => isActivePath(pathname, href)) ?? null,
    [pathname],
  );

  // Checkout strips the header to one way back, so the tab bar and the room kept for it step aside too.
  if (isFocusedPath(pathname)) return null;
  return (
    <>
      <div aria-hidden="true" className="box-content h-16 pb-safe lg:hidden" />
      <MobileNav activeHref={activeHref} cartCount={cartCount} />
    </>
  );
}
