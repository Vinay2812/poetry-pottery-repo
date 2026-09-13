import Link from "next/link";

import { PotteryIcon, toPotteryIconKind } from "@/components/icons/pottery";
import { cn } from "@/lib/utils";

export interface CategoryStripItem {
  slug: string;
  name: string;
  imageUrl: string | null;
  href: string;
  isActive: boolean;
}

export interface CategoryStripProps {
  items: CategoryStripItem[];
  allHref: string;
  isAllActive: boolean;
}

const LINK_CLASS =
  "flex shrink-0 items-center gap-2 border-b-2 pb-2 text-sm whitespace-nowrap transition-colors";

export function CategoryStrip({
  items,
  allHref,
  isAllActive,
}: CategoryStripProps) {
  return (
    <nav aria-label="Categories" className="-mx-4 border-b border-ash md:mx-0">
      <ul className="hide-scrollbar flex gap-6 overflow-x-auto px-4 md:px-0">
        <li className="shrink-0">
          <Link
            href={allHref}
            aria-current={isAllActive ? "page" : undefined}
            className={cn(
              LINK_CLASS,
              isAllActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            All pieces
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
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <PotteryIcon
                kind={toPotteryIconKind(item.slug)}
                className="size-5"
              />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
