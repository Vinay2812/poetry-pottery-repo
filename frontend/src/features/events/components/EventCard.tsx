import Image from "next/image";
import Link from "next/link";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface EventCardProps {
  href: string;
  title: string;
  imageUrl: string | null;
  dateLabel: string;
  typeLabel: string;
  seatsLabel: string;
  price: number;
  isPast: boolean;
  isPriority?: boolean;
}

const SIZES = "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw";

// Image first, then the date, the title and one plain line of type, seats and price.
export function EventCard({
  href,
  title,
  imageUrl,
  dateLabel,
  typeLabel,
  seatsLabel,
  price,
  isPast,
  isPriority = false,
}: EventCardProps) {
  return (
    <article className="group flex flex-col gap-2.5">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative aspect-square overflow-hidden bg-white"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            loading={isPriority ? "eager" : undefined}
            fetchPriority={isPriority ? "high" : undefined}
            sizes={SIZES}
            className={cn(
              "object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]",
              isPast && "opacity-80",
            )}
          />
        ) : (
          <PlaceholderImage kind="vase" />
        )}
      </Link>

      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-[13px] text-muted-foreground tnum">{dateLabel}</p>
        <Link
          href={href}
          className="text-[15px] leading-snug underline-offset-4 hover:underline"
        >
          {title}
        </Link>
        <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:justify-between md:gap-3">
          <p className="text-[13px] text-muted-foreground">
            {typeLabel} · {seatsLabel}
          </p>
          <span className="shrink-0 text-[13px] tnum">{formatInr(price)}</span>
        </div>
      </div>
    </article>
  );
}
