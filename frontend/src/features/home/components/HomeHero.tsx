import Image from "next/image";
import Link from "next/link";

import { KilnLabels, type KilnLabel } from "@/components/motion/KilnLabels";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";

export interface HomeHeroProps {
  heading: string;
  subheading: string;
  imageUrl: string | null;
  shopHref: string;
  shopLabel: string;
  sessionHref: string;
}

// Anchors sit on the drawn vase outline: left shoulder, right belly, foot.
const LABELS: KilnLabel[] = [
  { text: "Handmade", x: 28, y: 27, anchorX: 40.6, anchorY: 41.6 },
  { text: "Stoneware", x: 70, y: 50, anchorX: 62.8, anchorY: 54.7 },
  { text: "Sangli", x: 64, y: 80, anchorX: 50, anchorY: 68.8 },
];

export function HomeHero({
  heading,
  subheading,
  imageUrl,
  shopHref,
  shopLabel,
  sessionHref,
}: HomeHeroProps) {
  return (
    <section className="grid items-center gap-10 py-12 md:grid-cols-2 md:gap-16 md:py-20">
      <div className="relative aspect-square overflow-hidden bg-white md:order-2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="animate-clip-reveal object-cover"
          />
        ) : (
          <PlaceholderImage kind="vase" size="hero" />
        )}
        <KilnLabels labels={LABELS} isAnimated className="text-ink" />
      </div>

      <div className="animate-fade-up flex flex-col gap-6">
        <h1 className="font-heading text-[34px] leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl">
          {heading}
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
          {subheading}
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Link
            href={shopHref}
            className="border-b border-ink pb-0.5 hover:border-primary hover:text-primary"
          >
            {shopLabel}
          </Link>
          <Link
            href={sessionHref}
            className="border-b border-ink pb-0.5 hover:border-primary hover:text-primary"
          >
            Book a wheel session
          </Link>
        </div>
      </div>
    </section>
  );
}
