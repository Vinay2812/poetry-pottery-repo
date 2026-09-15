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
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-cream px-6 py-16 text-center">
      <p className="font-script text-3xl text-clay-dark italic">
        {isPast ? "Nothing in the archive yet" : "No dates on the calendar"}
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {isPast
          ? "Past workshops and open mics will show up here once they wrap up."
          : "We add wheel workshops and open mic evenings every few weeks. Check back soon or write to us for a private session."}
      </p>
      {hasFilters && (
        <Button
          variant="outline"
          className="rounded-full"
          onClick={onClearFilters}
        >
          Show everything
        </Button>
      )}
    </div>
  );
}
