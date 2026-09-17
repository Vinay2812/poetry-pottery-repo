"use client";

import Link from "next/link";
import { useRef } from "react";

import { ActiveMarker } from "@/components/nav/ActiveMarker";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toPhoneHref } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { NavLink } from "@/features/layout/types";

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
  // The sheet is opened from the header, not a Radix trigger, so it has to remember
  // the button itself or closing drops focus on the body.
  const openerRef = useRef<HTMLElement | null>(null);
  const phoneHref = toPhoneHref(contactPhone);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-dvh w-full flex-col"
        onOpenAutoFocus={() => {
          const opener = document.activeElement;
          openerRef.current = opener instanceof HTMLElement ? opener : null;
        }}
        onCloseAutoFocus={(event) => {
          if (!openerRef.current?.isConnected) return;
          event.preventDefault();
          openerRef.current.focus();
        }}
      >
        <SheetHeader className="px-6 py-5">
          <SheetTitle className="font-heading text-xl tracking-tight">
            Menu
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Menu" className="flex-1 overflow-y-auto px-6">
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
                Your cart
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
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-fit link-underline text-primary"
              >
                Message us on WhatsApp
              </a>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
