import Image from "next/image";
import Link from "next/link";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";

export interface AboutBlockProps {
  imageUrl: string | null;
  firstLine: string;
  secondLine: string;
  href: string;
}

// The landscape frame sits beside the studio's two lines, the first said in
// the heading voice so it reads as the owner speaking, not a caption.
export function AboutBlock({
  imageUrl,
  firstLine,
  secondLine,
  href,
}: AboutBlockProps) {
  return (
    <div className="grid gap-8 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12">
      <div className="relative aspect-16/9 overflow-hidden bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage kind="bowl" />
        )}
      </div>
      <div className="flex flex-col gap-4">
        <p className="font-heading text-lg leading-snug tracking-tight text-balance md:text-2xl">
          {firstLine}
        </p>
        <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">
          {secondLine}
        </p>
        <Link
          href={href}
          className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
        >
          Our story
        </Link>
      </div>
    </div>
  );
}
