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
        "flex shrink-0 items-baseline gap-1.5 tnum",
        size === "lg" ? "text-2xl" : "text-sm",
      )}
    >
      {prefix && (
        <span className="text-[13px] text-muted-foreground">{prefix}</span>
      )}
      <span className="text-foreground">{formatInr(price)}</span>
      {hasDiscount && (
        <s className="text-[13px] text-muted-foreground">
          {formatInr(compareAtPrice)}
        </s>
      )}
    </span>
  );
}
