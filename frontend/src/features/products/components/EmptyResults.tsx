import { Button } from "@/components/ui/button";

export interface EmptyResultsProps {
  search: string;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export function EmptyResults({
  search,
  hasActiveFilters,
  onClear,
}: EmptyResultsProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-cream px-6 py-16 text-center">
      <p className="font-script text-3xl text-clay-dark italic">
        Nothing on this shelf yet
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {search
          ? `No pieces match “${search}”. Try a glaze colour, a material or a simpler word.`
          : "No pieces match these filters. Loosen one or two and try again."}
      </p>
      {(hasActiveFilters || search) && (
        <Button variant="outline" className="rounded-full" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
