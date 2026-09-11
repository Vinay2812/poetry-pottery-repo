"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { MobileNav } from "@/features/layout/components/MobileNav";
import { isActivePath } from "@/features/layout/types";

const MOBILE_HREFS = ["/", "/products", "/workshops", "/cart"];

export interface MobileNavContainerProps {
  cartCount: number;
}

export function MobileNavContainer({ cartCount }: MobileNavContainerProps) {
  const pathname = usePathname();
  const activeHref = useMemo(
    () => MOBILE_HREFS.find((href) => isActivePath(pathname, href)) ?? null,
    [pathname],
  );

  return <MobileNav activeHref={activeHref} cartCount={cartCount} />;
}
