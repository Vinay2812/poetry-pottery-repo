import Link from "next/link";

import { ActiveMarker } from "@/components/nav/ActiveMarker";
import { cn } from "@/lib/utils";

export interface ShelfTabsProps {
  shelfHref: string;
  archiveHref: string;
  shelfCount: number;
  archiveCount: number;
  isArchive: boolean;
  onSelectShelf?: () => void;
}

// Plain left clicks are handled in the app so the switch is instant; modified clicks stay real links.
function isPlainClick(event: React.MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

const TAB_CLASS =
  "flex items-center gap-2 pb-3 text-sm whitespace-nowrap transition-colors";

// Two tabs under one hairline: what is on the shelf today, and everything the studio made before.
export function ShelfTabs({
  shelfHref,
  archiveHref,
  shelfCount,
  archiveCount,
  isArchive,
  onSelectShelf,
}: ShelfTabsProps) {
  // Only the shelf tab is a filter change this page can make itself; the archive
  // tab is a route, so its click is left alone to navigate.
  const handleShelfClick = (event: React.MouseEvent) => {
    if (!onSelectShelf || !isPlainClick(event)) return;
    event.preventDefault();
    onSelectShelf();
  };

  return (
    <nav aria-label="Shelf and archive" className="border-b border-ash">
      <ul className="flex gap-8">
        <li>
          <Link
            href={shelfHref}
            onClick={handleShelfClick}
            aria-current={isArchive ? undefined : "page"}
            className={cn(
              TAB_CLASS,
              isArchive
                ? "text-muted-foreground hover:text-foreground"
                : "text-foreground",
            )}
          >
            <ActiveMarker isActive={!isArchive} />
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
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ActiveMarker isActive={isArchive} />
            Archive{" "}
            <span className="text-muted-foreground tnum">({archiveCount})</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
