import { EmptyState } from "@/components/empty/EmptyState";

export function EmptyBookings() {
  return (
    <EmptyState
      kind="bowl"
      heading="No wheel sessions yet"
      line="Book an hour or two at the wheel and the session shows up here."
      actionLabel="Pick a day"
      actionHref="/workshops"
    />
  );
}
