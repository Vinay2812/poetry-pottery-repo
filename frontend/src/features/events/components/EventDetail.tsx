import { CalendarDays, Check, Clock, MapPin } from "lucide-react";
import Image from "next/image";

export interface EventDetailProps {
  title: string;
  imageUrl: string;
  typeLabel: string;
  levelLabel: string | null;
  dateLabel: string;
  timeRange: string;
  location: string;
  address: string;
  ratingAvg: number;
  ratingCount: number;
  description: string;
  includes: string[];
  highlights: string[];
  instructor: string | null;
  performers: string[];
  gallery: string[];
  isPast: boolean;
  reserveBox: React.ReactNode;
}

export function EventDetail({
  title,
  imageUrl,
  typeLabel,
  levelLabel,
  dateLabel,
  timeRange,
  location,
  address,
  ratingAvg,
  ratingCount,
  description,
  includes,
  highlights,
  instructor,
  performers,
  gallery,
  isPast,
  reserveBox,
}: EventDetailProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-8 md:py-10">
      <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-primary-light md:aspect-21/9">
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority
          sizes="(min-width: 1024px) 1152px, 100vw"
          className="object-cover"
        />
      </div>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold tracking-wide text-primary-hover">
            {typeLabel}
          </span>
          {levelLabel && (
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold tracking-wide text-clay-dark">
              {levelLabel}
            </span>
          )}
          {ratingCount > 0 && (
            <span className="text-xs text-muted-foreground">
              <span aria-hidden="true">★</span> {ratingAvg.toFixed(1)}
              <span className="sr-only"> stars from</span> ({ratingCount})
            </span>
          )}
        </div>
        <h1 className="font-heading text-3xl leading-tight text-balance md:text-5xl">
          {title}
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_380px] lg:items-start">
        <div className="flex flex-col gap-8">
          <section className="grid gap-4 rounded-3xl bg-card p-5 shadow-soft sm:grid-cols-3 md:p-6">
            <p className="flex items-start gap-3">
              <CalendarDays
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground">Date</span>
                <span className="text-sm font-medium">{dateLabel}</span>
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Clock
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground">Time</span>
                <span className="text-sm font-medium">{timeRange}</span>
              </span>
            </p>
            <p className="flex items-start gap-3">
              <MapPin
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="flex flex-col">
                <span className="text-xs text-muted-foreground">Where</span>
                <span className="text-sm font-medium">{location}</span>
                <span className="text-xs text-muted-foreground">{address}</span>
              </span>
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-2xl">About this session</h2>
            <p className="leading-relaxed whitespace-pre-line text-foreground/85">
              {description}
            </p>
          </section>

          {includes.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl">What is included</h2>
              <ul className="flex flex-col gap-2">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {highlights.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl">What you will take away</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl bg-primary-light p-4 text-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {instructor && (
            <section className="flex flex-col gap-2 rounded-3xl bg-cream p-5 md:p-6">
              <h2 className="text-xs font-semibold tracking-[0.12em] text-clay-dark uppercase">
                Led by
              </h2>
              <p className="font-script text-2xl italic">{instructor}</p>
            </section>
          )}

          {performers.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl">Line-up</h2>
              <ul className="flex flex-col gap-2">
                {performers.map((performer) => (
                  <li
                    key={performer}
                    className="rounded-2xl bg-card p-4 text-sm shadow-soft"
                  >
                    {performer}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isPast && gallery.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-2xl">From the evening</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {gallery.map((url, index) => (
                  <span
                    key={`${url}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-primary-light"
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
        </div>

        <aside className="order-first lg:sticky lg:top-24 lg:order-none">
          {reserveBox}
        </aside>
      </div>
    </div>
  );
}
