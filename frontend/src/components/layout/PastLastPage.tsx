import { Button } from "@/components/ui/button";

export interface PastLastPageProps {
  message: string;
  actionLabel: string;
  onLatest: () => void;
}

// A page number past the end of a list that does have records: say so and offer the first page.
export function PastLastPage({
  message,
  actionLabel,
  onLatest,
}: PastLastPageProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <p className="text-[15px] text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onLatest}>
        {actionLabel}
      </Button>
    </div>
  );
}
