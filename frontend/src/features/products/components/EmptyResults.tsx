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
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">
        Nothing on this shelf yet
      </h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        {search
          ? `No pieces match “${search}”. Try a glaze, a clay body or a simpler word.`
          : "No pieces match these filters. Loosen one and try again."}
      </p>
      {(hasActiveFilters || search) && (
        <Button variant="outline" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
