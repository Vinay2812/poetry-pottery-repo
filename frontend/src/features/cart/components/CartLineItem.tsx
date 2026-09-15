import Image from "next/image";
import Link from "next/link";

import { toPotteryIconKind } from "@/components/icons/pottery";
import { PlaceholderImage } from "@/components/media/PlaceholderImage";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

import { QuantityStepper } from "@/features/products/components/QuantityStepper";

export interface CartLineItemProps {
  href: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  lineTotal: number;
  quantity: number;
  maxQuantity: number;
  selectionSummary: string | null;
  isAvailable: boolean;
  canAdjustQuantity: boolean;
  unavailableReason: string | null;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  onSaveForLater: () => void;
}

const TEXT_LINK =
  "text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

export function CartLineItem({
  href,
  name,
  imageUrl,
  unitPrice,
  lineTotal,
  quantity,
  maxQuantity,
  selectionSummary,
  isAvailable,
  canAdjustQuantity,
  unavailableReason,
  onQuantityChange,
  onRemove,
  onSaveForLater,
}: CartLineItemProps) {
  return (
    <li className="flex gap-4 border-b border-ash py-6">
      <Link
        href={href}
        aria-label={name}
        className="relative size-24 shrink-0 overflow-hidden bg-white"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="96px"
            className={cn("object-cover", !isAvailable && "opacity-50")}
          />
        ) : (
          <PlaceholderImage kind={toPotteryIconKind(name)} />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href={href}
              className="line-clamp-2 text-sm leading-snug underline-offset-4 hover:underline"
            >
              {name}
            </Link>
            {selectionSummary && (
              <p className="mt-1 truncate text-[13px] text-muted-foreground">
                {selectionSummary}
              </p>
            )}
            <p className="mt-1 text-[13px] text-muted-foreground tnum">
              {formatInr(unitPrice)} each
            </p>
          </div>
          <p className="shrink-0 text-sm tnum">{formatInr(lineTotal)}</p>
        </div>
        {!isAvailable && unavailableReason && (
          <p className="text-[13px] text-terracotta-dark">
            {unavailableReason}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-4">
          {canAdjustQuantity && (
            <QuantityStepper
              value={quantity}
              max={maxQuantity}
              onChange={onQuantityChange}
              size="sm"
            />
          )}
          {/* Named per piece: a cart of three otherwise reads "Remove" three times. */}
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name}`}
            className={TEXT_LINK}
          >
            Remove
          </button>
          <button
            type="button"
            onClick={onSaveForLater}
            aria-label={`Save ${name} for later`}
            className={TEXT_LINK}
          >
            Save for later
          </button>
        </div>
      </div>
    </li>
  );
}
