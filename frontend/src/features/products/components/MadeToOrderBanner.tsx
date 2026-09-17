import Image from "next/image";
import Link from "next/link";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";

export interface MadeToOrderBannerProps {
  href: string;
  imageUrl: string | null;
  priceLabel: string;
}

export function MadeToOrderBanner({
  href,
  imageUrl,
  priceLabel,
}: MadeToOrderBannerProps) {
  return (
    // The square is held to a column the copy can stand beside, centred on it so
    // the heading sits level with the piece instead of above it.
    <div className="grid gap-8 md:grid-cols-[minmax(0,26rem)_1fr] md:items-center md:gap-16">
      <div className="relative aspect-square bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 26rem, 100vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage kind="mug" />
        )}
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Made to order
        </p>
        <h2 className="font-heading text-3xl leading-tight tracking-tight text-balance md:text-5xl">
          Your name, carved into a mug.
        </h2>
        <p className="max-w-md text-[15px] text-muted-foreground">
          Pick a size and a glaze, tell us the words, and we throw it fresh from{" "}
          {priceLabel}.
        </p>
        <Link
          href={href}
          className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
        >
          Start a made-to-order piece
        </Link>
      </div>
    </div>
  );
}
