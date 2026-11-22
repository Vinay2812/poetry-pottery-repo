"use client";

import { XIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { ActiveMarker } from "@/components/nav/ActiveMarker";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toPhoneHref } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { NavLink } from "@/features/layout/types";
import { WhatsAppLink } from "@/components/whatsapp/WhatsAppLink";

export interface MobileMenuSheetProps {
  isOpen: boolean;
  links: NavLink[];
  activeHref: string | null;
  isSignedIn: boolean;
  wishlistCount: number;
  contactPhone: string;
  whatsappUrl: string | null;
  onOpenChange: (isOpen: boolean) => void;
  onNavigate: () => void;
  onAccountClick: () => void;
  onSignOut: () => void;
}

// One left edge for every label; the active marker hangs in the gutter beside it.
// Rows are 44px so the whole row is the hit area, not the words in it.
const ROW_CLASS =
  "relative flex min-h-11 w-full items-center gap-2 text-left text-[15px] transition-colors hover:text-primary";
const MARKER_CLASS = "absolute top-1/2 -left-4 -translate-y-1/2";

export function MobileMenuSheet({
  isOpen,
  links,
  activeHref,
  isSignedIn,
  wishlistCount,
  contactPhone,
  whatsappUrl,
  onOpenChange,
  onNavigate,
  onAccountClick,
  onSignOut,
}: MobileMenuSheetProps) {
  const phoneHref = toPhoneHref(contactPhone);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-dvh flex-col"
        // Opening on the heading keeps the drawer's top in view; the first control can be "Sign in" below the fold.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          titleRef.current?.focus();
        }}
      >
        <SheetHeader className="shrink-0 border-b border-ash px-6 py-5">
          <SheetTitle
            ref={titleRef}
            tabIndex={-1}
            // The heading is not a tab stop, so Shift+Tab from it wraps to Close by hand.
            onKeyDown={(event) => {
              if (event.key !== "Tab" || !event.shiftKey) return;
              event.preventDefault();
              closeRef.current?.focus();
            }}
            className="font-heading text-xl tracking-tight focus:outline-none"
          >
            Menu
          </SheetTitle>
        </SheetHeader>

        {/* Only the body scrolls, so the heading and Close stay put on a landscape phone. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <nav aria-label="Menu" className="flex-1 px-6">
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
                      <ActiveMarker
                        isActive={isActive}
                        className={MARKER_CLASS}
                      />
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
                  Saved pieces
                  {wishlistCount > 0 && (
                    <span className="tnum">({wishlistCount})</span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  onClick={onNavigate}
                  className={cn(ROW_CLASS, "text-muted-foreground")}
                >
                  Cart
                </Link>
              </li>
              {isSignedIn && (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={onAccountClick}
                      className={cn(ROW_CLASS, "text-muted-foreground")}
                    >
                      Your account
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={onSignOut}
                      className={cn(ROW_CLASS, "text-muted-foreground")}
                    >
                      Sign out
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <SheetFooter className="gap-4 border-t border-ash px-6 py-5">
            {!isSignedIn && (
              <Button onClick={onAccountClick} className="w-full">
                Sign in
              </Button>
            )}
            <div className="flex flex-col gap-1.5 text-[13px]">
              {phoneHref && (
                <a href={phoneHref} className="w-fit link-underline">
                  {contactPhone}
                </a>
              )}
              {whatsappUrl && (
                <WhatsAppLink
                  href={whatsappUrl}
                  kind="general"
                  className="w-fit link-underline text-primary"
                >
                  Message us on WhatsApp
                </WhatsAppLink>
              )}
            </div>
          </SheetFooter>
        </div>

        <SheetClose asChild>
          <Button
            ref={closeRef}
            variant="ghost"
            size="icon-sm"
            // Last in the tab order but drawn in the header: 18px centres it on the heading's 28px line under 20px padding.
            className="absolute top-[18px] right-3"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
