import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CouponFieldProps {
  value: string;
  message: string | null;
  isApplied: boolean;
  isChecking: boolean;
  onChange: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
}

export function CouponField({
  value,
  message,
  isApplied,
  isChecking,
  onChange,
  onApply,
  onRemove,
}: CouponFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="coupon" className="text-[13px] text-muted-foreground">
        Have a code?
      </Label>
      <div className="flex gap-2">
        <Input
          id="coupon"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          placeholder="WELCOME10"
          className="uppercase"
          disabled={isApplied}
          aria-describedby="coupon-message"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onApply();
            }
          }}
        />
        {isApplied ? (
          <Button type="button" variant="outline" onClick={onRemove}>
            Remove
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onApply}
            disabled={!value.trim() || isChecking}
          >
            {isChecking ? "Checking…" : "Apply"}
          </Button>
        )}
      </div>
      {/* Always rendered so applying or clearing a code never nudges the totals. */}
      <p
        id="coupon-message"
        className={cn(
          "min-h-5 text-[13px]",
          isApplied ? "text-primary" : "text-muted-foreground",
        )}
        aria-live="polite"
      >
        {message}
      </p>
    </div>
  );
}
