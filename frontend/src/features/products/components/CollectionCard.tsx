import Image from "next/image";
import Link from "next/link";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";

export interface CollectionCardProps {
  href: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  endsLabel: string | null;
}

export function CollectionCard({
  href,
  name,
  imageUrl,
  productCount,
  endsLabel,
}: CollectionCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 outline-none focus-visible:ring-1 focus-visible:ring-ink"
    >
      <span className="relative block aspect-square overflow-hidden bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 30vw, 100vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage kind={toPotteryIconKind(name)} />
        )}
      </span>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm underline-offset-4 group-hover:underline">
          {name}
        </span>
        <span className="text-[13px] text-muted-foreground tnum">
          {productCount} pieces
        </span>
      </span>
      {endsLabel && (
        <span className="text-[13px] text-muted-foreground">{endsLabel}</span>
      )}
    </Link>
  );
}
