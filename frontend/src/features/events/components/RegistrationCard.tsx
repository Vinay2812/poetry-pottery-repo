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
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[13px] text-muted-foreground tnum">
          {dateLabel}
        </span>
        <span className="text-[15px] leading-snug underline-offset-4 group-hover:underline">
          {eventTitle}
        </span>
        <span className="text-[13px] text-muted-foreground">
          {typeLabel} · {pluralize(seats, "seat")} · {formatInr(total)}
        </span>
        <span className="text-[13px] text-muted-foreground">{statusLabel}</span>
      </span>
    </Link>
  );
}
