import Link from "next/link";

import { PotteryIcon, toPotteryIconKind } from "@/components/icons/pottery";

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
      className="group flex flex-col items-center gap-3 py-2 text-center outline-none focus-visible:ring-1 focus-visible:ring-ink"
    >
      <PotteryIcon
        kind={toPotteryIconKind(name)}
        className="size-10 text-ink transition-colors group-hover:text-primary"
      />
      <span className="text-sm underline-offset-4 group-hover:underline">
        {name}
      </span>
      <span className="-mt-2 text-[13px] text-muted-foreground tnum">
        {productCount} pieces
      </span>
    </Link>
  );
}
