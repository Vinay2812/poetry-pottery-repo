import Image from "next/image";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { PageShell } from "@/components/layout/PageShell";

import type { EventFact } from "@/features/events/types";

export interface EventDetailProps {
  title: string;
  imageUrl: string | null;
  typeLabel: string;
  facts: EventFact[];
  paragraphs: string[];
  includes: string[];
  gallery: string[];
  isPast: boolean;
  reserveBox: React.ReactNode;
  reviews: React.ReactNode;
}

export function EventDetail({
  title,
  imageUrl,
  typeLabel,
  facts,
  paragraphs,
  includes,
  gallery,
  isPast,
  reserveBox,
  reviews,
}: EventDetailProps) {
  return (
    <PageShell className="flex flex-col gap-10 py-8 md:py-12">
      <div className="relative aspect-4/3 overflow-hidden bg-white md:aspect-21/9">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage kind="vase" />
        )}
      </div>

      <header className="flex flex-col gap-3">
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          {typeLabel}
        </p>
        <h1 className="max-w-3xl font-heading text-3xl leading-tight tracking-tight text-balance md:text-5xl">
          {title}
        </h1>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_360px] lg:items-start">
        <div className="flex flex-col gap-10">
          <section aria-label="Session details" className="border-t border-ash">
            <dl>
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="grid grid-cols-[7rem_1fr] gap-4 border-b border-ash py-3 text-sm md:grid-cols-[9rem_1fr]"
                >
                  <dt className="text-muted-foreground">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {paragraphs.length > 0 && (
            <section className="flex max-w-2xl flex-col gap-3">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-[15px] leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </section>
          )}

          {includes.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-2xl tracking-tight">
                What&rsquo;s included
              </h2>
              <ul className="border-t border-ash">
                {includes.map((item) => (
                  <li
                    key={item}
                    className="border-b border-ash py-3 text-sm text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isPast && gallery.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-2xl tracking-tight">
                From the evening
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {gallery.map((url) => (
                  <span
                    key={url}
                    className="relative aspect-square overflow-hidden bg-white"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 240px, 45vw"
                      className="object-cover"
                    />
                  </span>
                ))}
              </div>
            </section>
          )}

          {reviews}
        </div>

        <aside className="order-first lg:sticky lg:top-24 lg:order-none">
          {reserveBox}
        </aside>
      </div>
    </PageShell>
  );
}
