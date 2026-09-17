import { EmptyState } from "@/components/empty/EmptyState";

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
  if (hasFilters) {
    return (
      <EmptyState
        kind="bowl"
        heading="Nothing matches these filters"
        line="Loosen one and the calendar fills back up."
        actionLabel="Show everything"
        onAction={onClearFilters}
      />
    );
  }
  // "Yet" is honest on the past tab: evenings land there once they wrap up.
  return isPast ? (
    <EmptyState
      kind="bowl"
      heading="Nothing in the archive yet"
      line="Past workshops and open mics show up here once they wrap up."
      actionLabel="See what is coming up"
      actionHref="/events"
    />
  ) : (
    <EmptyState
      kind="bowl"
      heading="No dates on the calendar"
      line="We add wheel workshops and open mic evenings every few weeks."
      actionLabel="Book a wheel session"
      actionHref="/workshops"
    />
  );
}
