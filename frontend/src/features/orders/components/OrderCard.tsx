import Image from "next/image";
import Link from "next/link";

import { formatInr } from "@/lib/format";

import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import type { StatusTone } from "@/features/orders/types";

export interface OrderCardProps {
  href: string;
  orderId: string;
  placedOn: string;
  statusLabel: string;
  statusTone: StatusTone;
  total: number;
  itemCount: number;
  imageUrls: string[];
}

export function OrderCard({
  href,
  orderId,
  placedOn,
  statusLabel,
  statusTone,
  total,
  itemCount,
  imageUrls,
}: OrderCardProps) {
  const shown = imageUrls.slice(0, 3);
  const extra = imageUrls.length - shown.length;
  return (
    <Link
      href={href}
      className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card md:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{placedOn}</p>
          <p className="font-mono text-sm font-semibold tracking-wide">
            {orderId}
          </p>
        </div>
        <OrderStatusBadge tone={statusTone} label={statusLabel} />
      </div>
      <div className="flex items-center gap-2">
        {shown.map((url, index) => (
          <span
            key={`${url}-${index}`}
            className="relative size-14 overflow-hidden rounded-xl bg-primary-light"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          </span>
        ))}
        {extra > 0 && (
          <span className="flex size-14 items-center justify-center rounded-xl bg-primary-light text-xs font-medium">
            +{extra}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {itemCount} {itemCount === 1 ? "piece" : "pieces"}
        </span>
        <span className="font-semibold">{formatInr(total)}</span>
      </div>
    </Link>
  );
}
