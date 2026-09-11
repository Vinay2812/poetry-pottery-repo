import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  unavailableReason: string | null;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  onSaveForLater: () => void;
}

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
  unavailableReason,
  onQuantityChange,
  onRemove,
  onSaveForLater,
}: CartLineItemProps) {
  return (
    <li className="flex gap-4 py-5">
      <Link
        href={href}
        aria-label={name}
        className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-primary-light md:size-28"
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="112px"
            className={cn(
              "object-cover",
              !isAvailable && "opacity-60 grayscale",
            )}
          />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={href}
              className="line-clamp-2 text-sm font-medium md:text-base"
            >
              {name}
            </Link>
            {selectionSummary && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selectionSummary}
              </p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatInr(unitPrice)} each
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold md:text-base">
            {formatInr(lineTotal)}
          </p>
        </div>
        {!isAvailable && unavailableReason && (
          <p className="text-xs font-medium text-terracotta-dark">
            {unavailableReason}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-3">
          {isAvailable && (
            <QuantityStepper
              value={quantity}
              max={maxQuantity}
              onChange={onQuantityChange}
              size="sm"
            />
          )}
          <button
            type="button"
            onClick={onSaveForLater}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Save for later
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name}`}
            className="ml-auto flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-primary-light hover:text-foreground"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
