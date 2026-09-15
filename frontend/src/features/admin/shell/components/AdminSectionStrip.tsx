import Link from "next/link";

import { cn } from "@/lib/utils";

import type { AdminNavLink } from "@/features/admin/shell/types";
import { isNavLinkActive } from "@/features/admin/shell/types";

export interface AdminSectionStripProps {
  links: AdminNavLink[];
  pathname: string;
}

/** The rail below the laptop breakpoint: one scrolling row, same hairline language. */
export function AdminSectionStrip({ links, pathname }: AdminSectionStripProps) {
  return (
    <nav
      aria-label="Studio sections"
      className="sticky top-14 z-20 hide-scrollbar overflow-x-auto border-b border-ash bg-background lg:hidden"
    >
      <ul className="flex w-max items-stretch">
        {links.map((link) => {
          const isActive = isNavLinkActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center border-b-2 px-3 text-[13px] whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
