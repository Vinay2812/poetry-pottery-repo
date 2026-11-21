import { Button } from "@/components/ui/button";

export interface CartLoadFailedProps {
  onRetry: () => void;
}

// Said plainly, so a cart that failed to load never passes for an empty one.
export function CartLoadFailed({ onRetry }: CartLoadFailedProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">
        That didn&apos;t load
      </h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        Nothing in your cart has changed. Try again in a moment.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
