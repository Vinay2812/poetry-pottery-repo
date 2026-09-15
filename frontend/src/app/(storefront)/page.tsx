import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/data/site-settings";

export default async function HomePage() {
  const hero = await getSiteSettings();

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 md:grid-cols-2 md:items-center md:px-8 md:py-16">
      <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] bg-primary-light md:order-2">
        {hero.hero_image_url && (
          <Image
            src={hero.hero_image_url}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-5">
        <p className="text-xs font-semibold tracking-[0.14em] text-terracotta uppercase">
          Handmade in Sangli
        </p>
        <h1 className="font-heading text-4xl leading-[1.05] text-balance md:text-6xl">
          {hero.hero_heading}
        </h1>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
          {hero.hero_subheading}
        </p>
        <div className="flex gap-3">
          <Button size="lg" className="rounded-full" asChild>
            <Link href={hero.hero_cta_href || "/products"}>
              {hero.hero_cta_text || "Shop the collection"}
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full" asChild>
            <Link href="/workshops">Book a wheel session</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
