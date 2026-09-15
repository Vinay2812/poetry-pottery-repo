import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface EventCardProps {
  href: string;
  title: string;
  imageUrl: string;
  day: string;
  month: string;
  weekday: string;
  typeLabel: string;
  levelLabel: string | null;
  timeRange: string;
  location: string;
  price: number;
  seatsLabel: string;
  isSeatsLow: boolean;
  isSoldOut: boolean;
  isPast: boolean;
  isPriority?: boolean;
}

export function EventCard({
  href,
  title,
  imageUrl,
  day,
  month,
  weekday,
  typeLabel,
  levelLabel,
  timeRange,
  location,
  price,
  seatsLabel,
  isSeatsLow,
  isSoldOut,
  isPast,
  isPriority = false,
}: EventCardProps) {
  return (
    <article className="group flex h-full flex-col gap-3 rounded-2xl bg-card p-3 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <Link
        href={href}
        className="relative block aspect-4/3 overflow-hidden rounded-xl bg-primary-light"
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority={isPriority}
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw"
          className={cn(
            "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
            (isPast || isSoldOut) && "opacity-75 grayscale-[30%]",
          )}
        />
        <span className="absolute top-2.5 left-2.5 flex w-14 flex-col items-center rounded-xl bg-background/95 py-1.5 backdrop-blur-sm">
          <span className="font-heading text-xl leading-none">{day}</span>
          <span className="text-[11px] font-semibold tracking-wide text-clay-dark uppercase">
            {month}
          </span>
          <span className="text-[11px] text-muted-foreground">{weekday}</span>
        </span>
        {isPast && (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-neutral-800/85 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
            Done
          </span>
        )}
      </Link>

      <div className="flex flex-wrap items-center gap-1.5 px-0.5">
        <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary-hover">
          {typeLabel}
        </span>
        {levelLabel && (
          <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold tracking-wide text-clay-dark">
            {levelLabel}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-1 px-0.5">
        <Link href={href} className="font-heading text-lg leading-snug">
          {title}
        </Link>
        <p className="text-sm text-muted-foreground">{timeRange}</p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </p>
        <p
          className={cn(
            "text-xs font-medium",
            isSeatsLow ? "text-terracotta-dark" : "text-muted-foreground",
          )}
        >
          {isPast ? "This one has wrapped up" : seatsLabel}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 px-0.5 pt-1">
        <span className="text-base font-semibold">
          {formatInr(price)}
          <span className="text-xs font-normal text-muted-foreground">
            {" "}
            per seat
          </span>
        </span>
        {isPast ? (
          <Link
            href={href}
            className="rounded-full bg-primary-light px-4 py-2 text-sm font-medium text-primary-hover transition-colors hover:bg-primary/15"
          >
            See how it went
          </Link>
        ) : isSoldOut ? (
          <Link
            href={href}
            className="rounded-full bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-300"
          >
            Ask about a seat
          </Link>
        ) : (
          <Link
            href={href}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary-hover"
          >
            Reserve
          </Link>
        )}
      </div>
    </article>
  );
}
