import { Button } from "@/components/ui/button";

export interface LoadFailedProps {
  heading: string;
  onRetry: () => void;
}

// A list under its page heading that did not arrive; the page itself is fine.
export function LoadFailed({ heading, onRetry }: LoadFailedProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 border-t border-ash py-16"
    >
      <h2 className="font-heading text-2xl tracking-tight">{heading}</h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        Something went wrong on our side.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
