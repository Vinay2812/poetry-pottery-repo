import Image from "next/image";
import Link from "next/link";

import { formatInr, pluralize } from "@/lib/format";

import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import type { StatusTone } from "@/features/orders/types";

export interface RegistrationCardProps {
  href: string;
  eventTitle: string;
  imageUrl: string;
  typeLabel: string;
  dateLabel: string;
  timeRange: string;
  location: string;
  seats: number;
  total: number;
  statusLabel: string;
  statusTone: StatusTone;
}

export function RegistrationCard({
  href,
  eventTitle,
  imageUrl,
  typeLabel,
  dateLabel,
  timeRange,
  location,
  seats,
  total,
  statusLabel,
  statusTone,
}: RegistrationCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card md:p-5"
    >
      <div className="flex items-start gap-4">
        <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-primary-light">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xs font-semibold tracking-wide text-clay-dark">
            {typeLabel}
          </span>
          <span className="font-heading text-lg leading-snug">
            {eventTitle}
          </span>
          <span className="text-sm text-muted-foreground">
            {dateLabel} · {timeRange}
          </span>
          <span className="truncate text-sm text-muted-foreground">
            {location}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <OrderStatusBadge tone={statusTone} label={statusLabel} />
        <span className="text-muted-foreground">
          {pluralize(seats, "seat")} ·{" "}
          <span className="font-semibold text-foreground">
            {formatInr(total)}
          </span>
        </span>
      </div>
    </Link>
  );
}
