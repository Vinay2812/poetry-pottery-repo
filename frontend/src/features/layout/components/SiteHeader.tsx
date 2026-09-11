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
      className="relative flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary-light"
    >
      {children}
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
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
  onSearchClick,
  onAccountClick,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 md:px-8">
        <Wordmark />

        <nav
          aria-label="Main"
          className="ml-8 hidden items-center gap-1 lg:flex"
        >
          {navLinks.map((link) => {
            const isActive = link.href === activeHref;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-light text-primary-hover"
                    : "text-muted-foreground hover:bg-primary-light/60 hover:text-foreground",
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
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-primary-light"
          >
            <Search className="size-5" />
          </button>
          <IconLink href="/wishlist" label="Wishlist" count={wishlistCount}>
            <Heart className="size-5" />
          </IconLink>
          <span className="hidden lg:contents">
            <IconLink href="/cart" label="Cart" count={cartCount}>
              <ShoppingBag className="size-5" />
            </IconLink>
          </span>
          {isAdmin && (
            <Link
              href="/dashboard"
              className="hidden rounded-full px-3 py-2 text-xs font-semibold tracking-wide text-primary uppercase hover:bg-primary-light lg:block"
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={onAccountClick}
            aria-label={isSignedIn ? "Your account" : "Sign in"}
            className="ml-1 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-primary-light"
          >
            {isSignedIn && userImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImageUrl}
                alt=""
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <UserRound className="size-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
