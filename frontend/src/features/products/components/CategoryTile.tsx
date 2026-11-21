import Image from "next/image";
import Link from "next/link";

import { CategoryPiece } from "@/components/media/CategoryPiece";
import { pluralize } from "@/lib/format";

export interface CategoryTileProps {
  href: string;
  slug: string;
  name: string;
  icon: string | null;
  imageUrl: string | null;
  productCount: number;
}

// The piece itself, photographed when admin uploaded one and drawn otherwise,
// then the name and one line.
export function CategoryTile({
  href,
  slug,
  name,
  icon,
  imageUrl,
  productCount,
}: CategoryTileProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-3 py-2 text-center"
    >
      {imageUrl ? (
        <span className="relative block size-16 overflow-hidden md:size-20">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        </span>
      ) : (
        <CategoryPiece
          slug={slug}
          icon={icon}
          className="size-16 tilt-straighten text-ink group-hover:text-primary md:size-20"
        />
      )}
      <span className="text-sm underline-offset-4 group-hover:underline">
        {name}
      </span>
      <span className="-mt-2 text-[13px] text-muted-foreground tnum">
        {pluralize(productCount, "piece")}
      </span>
    </Link>
  );
}
