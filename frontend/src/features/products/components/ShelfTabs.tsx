import Link from "next/link";

import { cn } from "@/lib/utils";

export interface ShelfTabsProps {
  shelfHref: string;
  archiveHref: string;
  shelfCount: number;
  archiveCount: number;
  isArchive: boolean;
}

const TAB_CLASS =
  "-mb-px border-b pb-3 text-sm whitespace-nowrap transition-colors";

// Two hairline tabs: what is on the shelf today, and everything the studio has made before.
export function ShelfTabs({
  shelfHref,
  archiveHref,
  shelfCount,
  archiveCount,
  isArchive,
}: ShelfTabsProps) {
  return (
    <nav aria-label="Shelf and archive" className="border-b border-ash">
      <ul className="flex gap-8">
        <li>
          <Link
            href={shelfHref}
            aria-current={isArchive ? undefined : "page"}
            className={cn(
              TAB_CLASS,
              isArchive
                ? "border-transparent text-muted-foreground hover:text-foreground"
                : "border-ink text-foreground",
            )}
          >
            On the shelf{" "}
            <span className="text-muted-foreground tnum">({shelfCount})</span>
          </Link>
        </li>
        <li>
          <Link
            href={archiveHref}
            aria-current={isArchive ? "page" : undefined}
            className={cn(
              TAB_CLASS,
              isArchive
                ? "border-ink text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Archive{" "}
            <span className="text-muted-foreground tnum">({archiveCount})</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
