import { EmptyState } from "@/components/empty/EmptyState";

export function EmptyRegistrations() {
  return (
    <EmptyState
      kind="vase"
      heading="No bookings yet"
      line="Reserve a seat at a workshop or an open mic and it shows up here."
      actionLabel="See what is coming up"
      actionHref="/events"
    />
  );
}
