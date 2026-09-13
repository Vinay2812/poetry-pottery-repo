import Link from "next/link";

import { HeroIllustration } from "@/features/home/components/HeroIllustration";

export interface HomeHeroProps {
  heading: string;
  subheading: string;
  shopHref: string;
  shopLabel: string;
  sessionHref: string;
}

export function HomeHero({
  heading,
  subheading,
  shopHref,
  shopLabel,
  sessionHref,
}: HomeHeroProps) {
  return (
    <section className="grid items-center gap-10 py-12 md:grid-cols-2 md:gap-16 md:py-20">
      <div className="relative aspect-square bg-clay-white md:order-2">
        <HeroIllustration isAnimated />
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
