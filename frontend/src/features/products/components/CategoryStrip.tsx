import Image from "next/image";
import Link from "next/link";

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

export function CategoryStrip({
  items,
  allHref,
  isAllActive,
}: CategoryStripProps) {
  return (
    <nav aria-label="Categories" className="-mx-4 md:mx-0">
      <ul className="hide-scrollbar flex gap-3 overflow-x-auto px-4 md:flex-wrap md:px-0">
        <li className="shrink-0">
          <Link
            href={allHref}
            aria-current={isAllActive ? "page" : undefined}
            className={cn(
              "flex h-16 items-center rounded-2xl px-4 text-sm font-medium transition-colors",
              isAllActive
                ? "bg-primary text-primary-foreground"
                : "bg-primary-light text-primary-hover hover:bg-primary/15",
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
                "flex h-16 items-center gap-3 rounded-2xl pr-4 pl-1.5 text-sm font-medium transition-colors",
                item.isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-cream text-foreground hover:bg-primary-light",
              )}
            >
              <span className="relative size-13 shrink-0 overflow-hidden rounded-xl bg-primary-light">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="52px"
                    className="object-cover"
                  />
                )}
              </span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
