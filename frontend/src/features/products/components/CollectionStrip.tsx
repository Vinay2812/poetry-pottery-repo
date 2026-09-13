import Link from "next/link";

import { cn } from "@/lib/utils";

export interface CollectionStripItem {
  slug: string;
  name: string;
  href: string;
  isActive: boolean;
}

export interface CollectionStripProps {
  items: CollectionStripItem[];
  allHref: string;
  isAllActive: boolean;
}

const LINK_CLASS =
  "flex shrink-0 items-center gap-2 text-[13px] whitespace-nowrap transition-colors";

function Marker({ isActive }: { isActive: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-1.5 border border-ink",
        isActive ? "bg-ink" : "border-ash bg-transparent",
      )}
    />
  );
}

// Stays on screen after a choice so one collection can be swapped for another.
export function CollectionStrip({
  items,
  allHref,
  isAllActive,
}: CollectionStripProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Collections" className="-mx-4 md:mx-0">
      <ul className="hide-scrollbar flex items-center gap-5 overflow-x-auto px-4 md:px-0">
        <li className="shrink-0">
          <Link
            href={allHref}
            aria-current={isAllActive ? "page" : undefined}
            className={cn(
              LINK_CLASS,
              isAllActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Marker isActive={isAllActive} />
            All collections
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.slug} className="shrink-0">
            <Link
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
              className={cn(
                LINK_CLASS,
                item.isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Marker isActive={item.isActive} />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
