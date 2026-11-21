import Image from "next/image";
import Link from "next/link";

import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { formatInr, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface RegistrationCardProps {
  href: string;
  eventTitle: string;
  imageUrl: string | null;
  typeLabel: string;
  dateLabel: string;
  seats: number;
  total: number;
  statusLabel: string;
  isClosed: boolean;
}

export function RegistrationCard({
  href,
  eventTitle,
  imageUrl,
  typeLabel,
  dateLabel,
  seats,
  total,
  statusLabel,
  isClosed,
}: RegistrationCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-4 border-b border-ash py-4",
        // A closed booking reads as a record, not as something still to turn up for.
        isClosed && "text-muted-foreground",
      )}
    >
      <span className="relative size-20 shrink-0 overflow-hidden bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="80px"
            className={cn("object-cover", isClosed && "opacity-60")}
          />
        ) : (
          <PlaceholderImage kind="vase" />
        )}
      </span>
      {/* Same rows as a wheel-session booking: date and price, what, how many, status. */}
      <span className="grid min-w-0 flex-1 grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1">
        <span className="text-[13px] text-muted-foreground tnum">
          {dateLabel}
        </span>
        <span className="text-[13px] tnum">{formatInr(total)}</span>
        <span className="col-span-2 text-[15px] leading-snug underline-offset-4 group-hover:underline">
          {eventTitle}
        </span>
        <span className="col-span-2 text-[13px] text-muted-foreground">
          {typeLabel} · {pluralize(seats, "seat")}
        </span>
        <span className="col-span-2 text-[13px] text-muted-foreground">
          {statusLabel}
        </span>
      </span>
    </Link>
  );
}
