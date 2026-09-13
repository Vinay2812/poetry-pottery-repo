import { Button } from "@/components/ui/button";

export interface EmptyEventsProps {
  isPast: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyEvents({
  isPast,
  hasFilters,
  onClearFilters,
}: EmptyEventsProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">
        {isPast ? "Nothing in the archive yet" : "No dates on the calendar"}
      </h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        {isPast
          ? "Past workshops and open mics show up here once they wrap up."
          : "We add wheel workshops and open mic evenings every few weeks."}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Show everything
        </Button>
      )}
    </div>
  );
}
