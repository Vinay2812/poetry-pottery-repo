import { CalendarDays, House, ShoppingBag, Store } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { formatBadgeCount } from "@/features/layout/types";

export interface MobileNavProps {
  activeHref: string | null;
  cartCount: number;
}

const ITEMS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/products", label: "Shop", Icon: Store },
  { href: "/workshops", label: "Workshops", Icon: CalendarDays },
  { href: "/cart", label: "Cart", Icon: ShoppingBag },
] as const;

export function MobileNav({ activeHref, cartCount }: MobileNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ash bg-background pb-safe lg:hidden"
    >
      <ul className="flex h-16 items-stretch">
        {ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === activeHref;
          const count = href === "/cart" ? cartCount : 0;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={count > 0 ? `${label} (${count})` : label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1.5 text-[11px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <Icon className="size-5" strokeWidth={1.5} />
                  {count > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-2.5 text-[10px] font-medium text-primary tnum"
                    >
                      {formatBadgeCount(count)}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "border-b-2 pb-0.5",
                    isActive ? "border-primary" : "border-transparent",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
