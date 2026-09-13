import Image from "next/image";
import Link from "next/link";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
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
    <Link href={href} className="text-sm underline-offset-4 hover:underline">
      {name}
    </Link>
  ) : (
    <span className="text-sm">{name}</span>
  );
  return (
    <li className="flex items-center gap-4 border-b border-ash py-4">
      <span className="relative size-16 shrink-0 overflow-hidden bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <PlaceholderImage kind={toPotteryIconKind(name)} />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title}
        {selectionSummary && (
          <p className="text-[13px] text-muted-foreground">
            {selectionSummary}
          </p>
        )}
        <p className="text-[13px] text-muted-foreground tnum">
          {quantity} × {formatInr(unitPrice)}
        </p>
      </div>
      <span className="text-sm tnum">{formatInr(lineTotal)}</span>
    </li>
  );
}
