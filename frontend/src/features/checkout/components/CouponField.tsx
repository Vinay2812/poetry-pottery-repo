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
      <Label htmlFor="coupon">Have a code?</Label>
      <div className="flex gap-2">
        <Input
          id="coupon"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          placeholder="WELCOME10"
          className="h-11 rounded-xl font-mono uppercase"
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
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            onClick={onRemove}
          >
            Remove
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="h-11 rounded-xl"
            onClick={onApply}
            disabled={!value.trim() || isChecking}
          >
            {isChecking ? "Checking…" : "Apply"}
          </Button>
        )}
      </div>
      {message && (
        <p
          id="coupon-message"
          className={cn(
            "text-xs",
            isApplied ? "text-primary-hover" : "text-terracotta-dark",
          )}
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
}
