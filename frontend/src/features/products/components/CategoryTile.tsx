import Image from "next/image";
import Link from "next/link";

export interface CategoryTileProps {
  href: string;
  name: string;
  imageUrl: string | null;
  productCount: number;
}

export function CategoryTile({
  href,
  name,
  imageUrl,
  productCount,
}: CategoryTileProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 text-center"
    >
      <span className="relative aspect-square w-full overflow-hidden rounded-full bg-primary-light shadow-soft transition-all group-hover:-translate-y-1 group-hover:shadow-card">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 14vw, 30vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        )}
      </span>
      <span className="text-sm font-medium">{name}</span>
      <span className="-mt-1.5 text-xs text-muted-foreground">
        {productCount}
      </span>
    </Link>
  );
}
