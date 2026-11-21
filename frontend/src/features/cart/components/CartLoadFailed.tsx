import { Button } from "@/components/ui/button";

export interface CartLoadFailedProps {
  onRetry: () => void;
}

// Said plainly, so a cart that failed to load never passes for an empty one.
export function CartLoadFailed({ onRetry }: CartLoadFailedProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">
        Your cart did not load
      </h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        Your pieces are still saved. Something went wrong on our side.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
