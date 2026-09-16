import { EmptyState } from "@/components/empty/EmptyState";

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
  // Nothing is coming to a filtered result, so "yet" would be a lie here.
  if (search) {
    return (
      <EmptyState
        kind="mug"
        heading={`Nothing matches “${search}”`}
        line="Try a glaze, a clay body or a simpler word."
        actionLabel="Clear the search"
        onAction={onClear}
      />
    );
  }
  if (hasActiveFilters) {
    return (
      <EmptyState
        kind="mug"
        heading="Nothing matches these filters"
        line="Loosen one and the shelf fills back up."
        actionLabel="Clear filters"
        onAction={onClear}
      />
    );
  }
  return (
    <EmptyState
      kind="mug"
      heading="Nothing on this shelf yet"
      line="The next batch goes in the kiln shortly."
      actionLabel="Ask for a piece"
      actionHref="/custom"
    />
  );
}
