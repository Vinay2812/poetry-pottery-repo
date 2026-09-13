import Image from "next/image";
import Link from "next/link";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";

import { HowItsMade } from "@/features/home/components/HowItsMade";

export interface AboutBlockProps {
  imageUrl: string | null;
  firstLine: string;
  secondLine: string;
  href: string;
}

export function AboutBlock({
  imageUrl,
  firstLine,
  secondLine,
  href,
}: AboutBlockProps) {
  return (
    <div className="flex flex-col gap-10">
      <div className="relative aspect-16/7 overflow-hidden bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage kind="bowl" />
        )}
      </div>
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col gap-4">
          <p className="max-w-md text-[15px] leading-relaxed">{firstLine}</p>
          <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
            {secondLine}
          </p>
          <Link
            href={href}
            className="w-fit border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
          >
            Our story
          </Link>
        </div>
        <HowItsMade />
      </div>
    </div>
  );
}
