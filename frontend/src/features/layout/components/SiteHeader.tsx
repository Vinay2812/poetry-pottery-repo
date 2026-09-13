import { Heart, Search, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Wordmark } from "@/features/layout/components/Wordmark";
import { formatBadgeCount, type NavLink } from "@/features/layout/types";

export interface SiteHeaderProps {
  navLinks: NavLink[];
  activeHref: string | null;
  cartCount: number;
  wishlistCount: number;
  isSignedIn: boolean;
  isAdmin: boolean;
  userImageUrl: string | null;
  isHome?: boolean;
  onSearchClick: () => void;
  onAccountClick: () => void;
}

interface IconLinkProps {
  href: string;
  label: string;
  count?: number;
  children: React.ReactNode;
}

function IconLink({ href, label, count = 0, children }: IconLinkProps) {
  return (
    <Link
      href={href}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="relative flex size-10 items-center justify-center text-foreground transition-colors hover:text-primary"
    >
      {children}
      {count > 0 && (
        <span className="absolute top-1 right-0 text-[11px] font-medium text-primary tnum">
          {formatBadgeCount(count)}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader({
  navLinks,
  activeHref,
  cartCount,
  wishlistCount,
  isSignedIn,
  isAdmin,
  userImageUrl,
  isHome = false,
  onSearchClick,
  onAccountClick,
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background",
        isHome ? "border-kiln" : "border-ash",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-5 px-4 md:px-8">
        <Wordmark />

        <span aria-hidden="true" className="hidden h-6 w-px bg-ash lg:block" />

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => {
            const isActive = link.href === activeHref;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-sm transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onSearchClick}
            aria-label="Search"
            className="flex size-10 items-center justify-center transition-colors hover:text-primary"
          >
            <Search className="size-5" strokeWidth={1.5} />
          </button>
          <IconLink href="/wishlist" label="Wishlist" count={wishlistCount}>
            <Heart className="size-5" strokeWidth={1.5} />
          </IconLink>
          <span className="hidden lg:contents">
            <IconLink href="/cart" label="Cart" count={cartCount}>
              <ShoppingBag className="size-5" strokeWidth={1.5} />
            </IconLink>
          </span>
          {isAdmin && (
            <Link
              href="/dashboard"
              className="hidden px-3 py-2 text-[11px] tracking-[0.18em] text-muted-foreground uppercase hover:text-foreground lg:block"
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={onAccountClick}
            aria-label={isSignedIn ? "Your account" : "Sign in"}
            className="ml-1 flex size-10 items-center justify-center transition-colors hover:text-primary"
          >
            {isSignedIn && userImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImageUrl}
                alt=""
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <UserRound className="size-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      <nav
        aria-label="Sections"
        className="hide-scrollbar flex gap-5 overflow-x-auto px-4 pb-3 lg:hidden"
      >
        {navLinks.map((link) => {
          const isActive = link.href === activeHref;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "shrink-0 text-[13px] whitespace-nowrap transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
