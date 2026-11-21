import Image from "next/image";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";

import { ContentHeader } from "@/features/content/components/ContentHeader";

export interface ContentHeroProps {
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
}

export function ContentHero({ title, subtitle, imageUrl }: ContentHeroProps) {
  return (
    <div className="flex flex-col pb-12 md:pb-16">
      <ContentHeader title={title} subtitle={subtitle} />
      <div className="relative aspect-16/9 overflow-hidden bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
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
