import Image from "next/image";

import { formatInr } from "@/lib/format";

export interface CheckoutLineItemProps {
  name: string;
  imageUrl: string | null;
  quantity: number;
  lineTotal: number;
  selectionSummary: string | null;
}

export function CheckoutLineItem({
  name,
  imageUrl,
  quantity,
  lineTotal,
  selectionSummary,
}: CheckoutLineItemProps) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-primary-light">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        )}
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
          {quantity}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        {selectionSummary && (
          <p className="truncate text-xs text-muted-foreground">
            {selectionSummary}
          </p>
        )}
      </div>
      <span className="text-sm font-semibold">{formatInr(lineTotal)}</span>
    </li>
  );
}
