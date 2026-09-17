import Link from "next/link";

import { CategoryPiece } from "@/components/media/CategoryPiece";
import { pluralize } from "@/lib/format";

export interface CategoryTileProps {
  href: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  productCount: number;
}

// The piece itself, drawn, then the name and one line. No thumbnails, so the
// row stays quiet.
export function CategoryTile({
  href,
  slug,
  name,
  productCount,
}: CategoryTileProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-3 py-2 text-center"
    >
      <CategoryPiece
        slug={slug}
        className="size-16 tilt-straighten text-ink group-hover:text-primary md:size-20"
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
