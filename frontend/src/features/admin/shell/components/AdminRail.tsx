import Link from "next/link";

import { cn } from "@/lib/utils";

import type { AdminNavLink } from "@/features/admin/shell/types";
import { isNavLinkActive } from "@/features/admin/shell/types";

export interface AdminRailProps {
  links: AdminNavLink[];
  pathname: string;
}

export function AdminRail({ links, pathname }: AdminRailProps) {
  return (
    <nav
      aria-label="Studio sections"
      className="hidden w-52 shrink-0 border-r border-ash lg:block"
    >
      <ul className="sticky top-14 flex flex-col py-2">
        {links.map((link) => {
          const isActive = isNavLinkActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center border-l-2 pl-4 text-sm transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
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
