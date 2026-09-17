import Image from "next/image";
import Link from "next/link";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
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
      className="flex flex-col gap-4 border border-ash p-4 transition-colors duration-200 hover:border-ink md:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] text-muted-foreground">{placedOn}</p>
          <p className="text-sm tracking-wide tnum">{orderId}</p>
        </div>
        <OrderStatusBadge tone={statusTone} label={statusLabel} />
      </div>
      <div className="flex items-center gap-2">
        {shown.map((url, index) => (
          <span key={`${url}-${index}`} className="relative size-14 bg-white">
            <Image
              src={url}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
            />
          </span>
        ))}
        {shown.length === 0 && (
          <span className="relative size-14 bg-white">
            <PlaceholderImage kind={toPotteryIconKind(orderId)} />
          </span>
        )}
        {extra > 0 && (
          <span className="flex size-14 items-center justify-center bg-clay-white text-[13px] tnum">
            +{extra}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-ash pt-3 text-sm">
        <span className="text-muted-foreground">
          {itemCount} {itemCount === 1 ? "piece" : "pieces"}
        </span>
        <span className="tnum">{formatInr(total)}</span>
      </div>
    </Link>
  );
}
