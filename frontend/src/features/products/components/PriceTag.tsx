import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PriceTagProps {
  price: number;
  compareAtPrice: number | null;
  size?: "sm" | "lg";
  prefix?: string;
}

export function PriceTag({
  price,
  compareAtPrice,
  size = "sm",
  prefix,
}: PriceTagProps) {
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price;
  return (
    <span
      className={cn(
        "flex items-baseline gap-1.5",
        size === "lg" ? "text-2xl" : "text-sm",
      )}
    >
      {prefix && (
        <span className="text-xs font-normal text-muted-foreground">
          {prefix}
        </span>
      )}
      <span className="font-semibold text-foreground">{formatInr(price)}</span>
      {hasDiscount && (
        <s className="text-xs text-muted-foreground">
          {formatInr(compareAtPrice)}
        </s>
      )}
    </span>
  );
}
