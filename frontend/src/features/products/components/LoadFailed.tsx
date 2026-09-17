import { Button } from "@/components/ui/button";

export interface LoadFailedProps {
  onRetry: () => void;
}

export function LoadFailed({ onRetry }: LoadFailedProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">
        The shelf did not load
      </h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        Something went wrong on our side.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
