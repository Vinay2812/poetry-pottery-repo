import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

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
    <section className="grid overflow-hidden rounded-[2rem] bg-primary text-primary-foreground md:grid-cols-2">
      <div className="flex flex-col gap-4 p-8 md:p-12">
        <p className="text-xs font-semibold tracking-[0.14em] text-primary-light uppercase">
          Made to order
        </p>
        <h2 className="font-heading text-3xl text-balance md:text-5xl">
          A mug with your name carved into the clay
        </h2>
        <p className="max-w-md text-primary-foreground">
          Pick a size and a glaze, tell us the words, and we throw it fresh on
          the wheel. Ready in about ten days. From {priceLabel}.
        </p>
        <Button
          variant="secondary"
          size="lg"
          className="w-fit rounded-full"
          asChild
        >
          <Link href={href}>Design yours</Link>
        </Button>
      </div>
      <div className="relative min-h-64 md:min-h-full">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="A custom mug on the wheel"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
    </section>
  );
}
