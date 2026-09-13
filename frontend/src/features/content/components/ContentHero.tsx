import Image from "next/image";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";

export interface ContentHeroProps {
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
}

export function ContentHero({ title, subtitle, imageUrl }: ContentHeroProps) {
  return (
    <div className="flex flex-col gap-8 py-12 md:gap-10 md:py-16">
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[15px] text-muted-foreground md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      <div className="relative aspect-16/9 overflow-hidden bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage kind="vase" />
        )}
      </div>
    </div>
  );
}
