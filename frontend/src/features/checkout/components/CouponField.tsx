import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CouponFieldProps {
  value: string;
  message: string | null;
  isApplied: boolean;
  isChecking: boolean;
  isOpen: boolean;
  onChange: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
  onOpen: () => void;
}

export function CouponField({
  value,
  message,
  isApplied,
  isChecking,
  isOpen,
  onChange,
  onApply,
  onRemove,
  onOpen,
}: CouponFieldProps) {
  // A discount box standing open above the totals asks a question nobody needed asking.
  if (!isOpen && !isApplied) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="w-fit border-b border-ink pb-0.5 text-[13px] hover:border-primary hover:text-primary"
      >
        Have a code?
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="coupon" className="text-[13px] text-muted-foreground">
        Have a code?
      </Label>
      {/* Disabled as a set so Apply and Remove can never be in flight together. */}
      <fieldset disabled={isChecking} className="flex min-w-0 gap-2">
        <Input
          id="coupon"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          placeholder="Enter your code"
          autoFocus
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
      </fieldset>
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
