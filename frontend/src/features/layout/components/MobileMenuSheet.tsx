import Link from "next/link";

import { ActiveMarker } from "@/components/nav/ActiveMarker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { NavLink } from "@/features/layout/types";

export interface MobileMenuSheetProps {
  isOpen: boolean;
  links: NavLink[];
  activeHref: string | null;
  isSignedIn: boolean;
  wishlistCount: number;
  onOpenChange: (isOpen: boolean) => void;
  onNavigate: () => void;
  onAccountClick: () => void;
  onSignOut: () => void;
}

const ROW_CLASS =
  "flex items-center gap-3 py-3 text-[15px] transition-colors hover:text-primary";

export function MobileMenuSheet({
  isOpen,
  links,
  activeHref,
  isSignedIn,
  wishlistCount,
  onOpenChange,
  onNavigate,
  onAccountClick,
  onSignOut,
}: MobileMenuSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex h-dvh w-full flex-col">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl tracking-tight">
            Menu
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Menu" className="flex-1 overflow-y-auto px-4">
          <ul className="flex flex-col">
            {links.map((link) => {
              const isActive = link.href === activeHref;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      ROW_CLASS,
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <ActiveMarker isActive={isActive} />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <ul className="mt-4 flex flex-col border-t border-ash pt-2">
            <li>
              <Link
                href="/wishlist"
                onClick={onNavigate}
                className={cn(ROW_CLASS, "text-muted-foreground")}
              >
                <ActiveMarker isActive={false} />
                Saved pieces
                {wishlistCount > 0 && (
                  <span className="tnum">({wishlistCount})</span>
                )}
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={onAccountClick}
                className={cn(ROW_CLASS, "w-full text-muted-foreground")}
              >
                <ActiveMarker isActive={false} />
                {isSignedIn ? "Your account" : "Sign in"}
              </button>
            </li>
            {isSignedIn && (
              <li>
                <button
                  type="button"
                  onClick={onSignOut}
                  className={cn(ROW_CLASS, "w-full text-muted-foreground")}
                >
                  <ActiveMarker isActive={false} />
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
