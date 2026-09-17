import Image from "next/image";
import Link from "next/link";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";

export interface AboutBlockProps {
  imageUrl: string | null;
  firstLine: string;
  secondLine: string;
  href: string;
}

// Two lines and a link do not need a full-bleed photograph above them: the
// landscape frame sits beside the copy, and the copy sits level with it.
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
        <p className="text-[15px] leading-relaxed">{firstLine}</p>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
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
