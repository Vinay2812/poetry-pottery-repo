import Image from "next/image";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
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
    <li className="flex items-center gap-3 border-b border-ash py-4">
      <span className="relative size-14 shrink-0 overflow-hidden bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage kind={toPotteryIconKind(name)} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{name}</p>
        {selectionSummary && (
          <p className="truncate text-[13px] text-muted-foreground">
            {selectionSummary}
          </p>
        )}
        <p className="text-[13px] text-muted-foreground tnum">
          Quantity {quantity}
        </p>
      </div>
      <span className="text-sm tnum">{formatInr(lineTotal)}</span>
    </li>
  );
}
