import Image from "next/image";
import Link from "next/link";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";

import { PriceTag } from "@/features/products/components/PriceTag";

export interface ArchiveCardProps {
  href: string;
  name: string;
  imageUrl: string | null;
  price: number;
  note: string;
  isPriority?: boolean;
  isEager?: boolean;
  onRemoveFromWishlist?: () => void;
}

const SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw";

// A past piece: photo, name, price and where it went. Nothing to add; saved ones can still be let go.
export function ArchiveCard({
  href,
  name,
  imageUrl,
  price,
  note,
  onRemoveFromWishlist,
  isPriority = false,
  isEager = false,
}: ArchiveCardProps) {
  return (
    <article className="group flex flex-col gap-2.5">
      <Link
        href={href}
        className="relative aspect-square overflow-hidden bg-white"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            loading={isEager ? "eager" : undefined}
            fetchPriority={isPriority ? "high" : undefined}
            sizes={SIZES}
            className="photo-zoom object-cover opacity-80 transition-opacity duration-500 ease-out group-hover:opacity-100"
          />
        ) : (
          <PlaceholderImage kind={toPotteryIconKind(name)} />
        )}
      </Link>

      {/* Same reserved name and note heights as ProductCard, so mixed rows stay level. */}
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-h-10 items-start justify-between gap-3">
          <Link
            href={href}
            className="min-w-0 text-sm leading-snug break-words underline-offset-4 hover:underline"
          >
            {name}
          </Link>
          <PriceTag price={price} compareAtPrice={null} />
        </div>
        <p className="min-h-5 text-[13px] text-muted-foreground">{note}</p>
        {onRemoveFromWishlist && (
          <button
            type="button"
            onClick={onRemoveFromWishlist}
            className="self-start link-underline text-[13px] text-muted-foreground"
          >
            Remove from saved pieces
          </button>
        )}
      </div>
    </article>
  );
}
