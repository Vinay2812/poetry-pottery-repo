import Image from "next/image";
import Link from "next/link";

import { formatInr } from "@/lib/format";

export interface OrderItemRowProps {
  href: string | null;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectionSummary: string | null;
}

export function OrderItemRow({
  href,
  name,
  imageUrl,
  quantity,
  unitPrice,
  lineTotal,
  selectionSummary,
}: OrderItemRowProps) {
  const title = href ? (
    <Link href={href} className="text-sm font-medium hover:underline">
      {name}
    </Link>
  ) : (
    <span className="text-sm font-medium">{name}</span>
  );
  return (
    <li className="flex items-center gap-4 py-3">
      <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-primary-light">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </span>
      <div className="min-w-0 flex-1">
        {title}
        {selectionSummary && (
          <p className="text-xs text-muted-foreground">{selectionSummary}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {quantity} × {formatInr(unitPrice)}
        </p>
      </div>
      <span className="text-sm font-semibold">{formatInr(lineTotal)}</span>
    </li>
  );
}
