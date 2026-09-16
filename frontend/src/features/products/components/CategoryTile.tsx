import Link from "next/link";

import { PotteryIcon, toPotteryIconKind } from "@/components/icons/pottery";
import { pluralize } from "@/lib/format";

export interface CategoryTileProps {
  href: string;
  name: string;
  imageUrl: string | null;
  productCount: number;
}

// Drawn icon, name, one line. No thumbnails, so the row stays quiet.
export function CategoryTile({ href, name, productCount }: CategoryTileProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-3 py-2 text-center"
    >
      <PotteryIcon
        kind={toPotteryIconKind(name)}
        className="size-10 tilt-straighten text-ink group-hover:text-primary"
      />
      <span className="text-sm underline-offset-4 group-hover:underline">
        {name}
      </span>
      <span className="-mt-2 text-[13px] text-muted-foreground tnum">
        {pluralize(productCount, "piece")}
      </span>
    </Link>
  );
}
