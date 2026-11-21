import { EmptyState } from "@/components/empty/EmptyState";

export interface EmptyAddressesProps {
  isSignedIn: boolean;
  onAddClick: () => void;
  onSignIn: () => void;
}

export function EmptyAddresses({
  isSignedIn,
  onAddClick,
  onSignIn,
}: EmptyAddressesProps) {
  if (!isSignedIn) {
    return (
      <EmptyState
        kind="small-things"
        heading="Sign in to see your addresses"
        line="We keep where your pieces go, ready for next time."
        actionLabel="Sign in"
        onAction={onSignIn}
      />
    );
  }
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
