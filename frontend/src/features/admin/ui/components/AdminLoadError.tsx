import { Button } from "@/components/ui/button";

export interface AdminLoadErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

/** Where a list or page would be when its first load failed: what went wrong and a way to ask again. */
export function AdminLoadError({
  message,
  isRetrying,
  onRetry,
}: AdminLoadErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 py-8">
      <p className="text-[13px]">{message}</p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isRetrying}
        onClick={onRetry}
      >
        {isRetrying ? "Trying again…" : "Try again"}
      </Button>
    </div>
  );
}
