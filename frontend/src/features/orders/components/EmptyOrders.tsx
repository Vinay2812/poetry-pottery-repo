import { EmptyState } from "@/components/empty/EmptyState";

export function EmptyOrders() {
  return (
    <EmptyState
      kind="plate"
      heading="No orders yet"
      line="Orders you place will show up here with their progress."
      actionLabel="Browse pieces"
      actionHref="/products"
    />
  );
}
