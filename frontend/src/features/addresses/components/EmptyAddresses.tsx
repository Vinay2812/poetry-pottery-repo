import { EmptyState } from "@/components/empty/EmptyState";

export interface EmptyAddressesProps {
  onAddClick: () => void;
}

export function EmptyAddresses({ onAddClick }: EmptyAddressesProps) {
  return (
    <EmptyState
      kind="small-things"
      heading="No addresses saved yet"
      line="Add where your pieces should go and we will keep it for next time."
      actionLabel="Add an address"
      onAction={onAddClick}
    />
  );
}
