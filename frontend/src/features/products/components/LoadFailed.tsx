import { Button } from "@/components/ui/button";

export interface LoadFailedProps {
  onRetry: () => void;
}

export function LoadFailed({ onRetry }: LoadFailedProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-cream px-6 py-16 text-center">
      <p className="font-script text-3xl text-clay-dark italic">
        The shelf did not load
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Something went wrong on our side. Give it another go.
      </p>
      <Button variant="outline" className="rounded-full" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
