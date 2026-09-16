import { Button } from "@/components/ui/button";

export interface PageErrorProps {
  title: string;
  message: string;
  retryLabel?: string;
  onRetry: () => void;
}

export function PageError({
  title,
  message,
  retryLabel = "Try again",
  onRetry,
}: PageErrorProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-20 md:py-28">
      <p className="text-[13px] tracking-[0.18em] text-muted-foreground uppercase">
        Something broke
      </p>
      <h1 className="font-heading text-4xl leading-tight tracking-tight md:text-6xl">
        {title}
      </h1>
      <p className="max-w-sm text-[15px] text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}
