import { EmptyState } from "@/components/empty/EmptyState";

export interface EmptyResultsProps {
  search: string;
  hasActiveFilters: boolean;
  // True when the made-to-order switch is the only filter on.
  isMadeToOrderOnly?: boolean;
  onClear: () => void;
}

export function EmptyResults({
  search,
  hasActiveFilters,
  isMadeToOrderOnly = false,
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
  // Nothing to loosen here: the way forward is asking for a piece.
  if (isMadeToOrderOnly) {
    return (
      <EmptyState
        kind="mug"
        heading="No made-to-order pieces listed right now"
        line="Tell us what you have in mind and we will throw it for you."
        actionLabel="Ask for a piece"
        actionHref="/custom"
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
