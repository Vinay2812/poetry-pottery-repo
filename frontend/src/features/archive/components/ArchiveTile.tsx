import Image from "next/image";
import Link from "next/link";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";

export interface ArchiveTileProps {
  href: string;
  name: string;
  imageUrl: string | null;
  madeLabel: string;
  isPriority?: boolean;
  isEager?: boolean;
}

const SIZES = "(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw";

// Bigger than a shelf card and carrying no price: the photograph is the point here.
export function ArchiveTile({
  href,
  name,
  imageUrl,
  madeLabel,
  isPriority = false,
  isEager = false,
}: ArchiveTileProps) {
  return (
    <article className="group flex flex-col gap-3">
      <Link
        href={href}
        className="relative aspect-square overflow-hidden bg-white outline-none focus-visible:ring-1 focus-visible:ring-ink"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            loading={isEager ? "eager" : undefined}
            fetchPriority={isPriority ? "high" : undefined}
            sizes={SIZES}
            className="photo-zoom object-cover"
          />
        ) : (
          <PlaceholderImage kind={toPotteryIconKind(name)} />
        )}
      </Link>
      <div className="flex flex-col gap-1">
        <Link
          href={href}
          className="w-fit text-[15px] leading-snug underline-offset-4 hover:underline"
        >
          {name}
        </Link>
        <p className="text-[13px] text-muted-foreground">{madeLabel}</p>
      </div>
    </article>
  );
}
