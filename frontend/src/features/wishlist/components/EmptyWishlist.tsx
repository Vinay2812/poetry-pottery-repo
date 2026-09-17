import { EmptyState } from "@/components/empty/EmptyState";

export interface EmptyWishlistProps {
  isSignedIn: boolean;
  onSignIn: () => void;
}

export function EmptyWishlist({ isSignedIn, onSignIn }: EmptyWishlistProps) {
  if (!isSignedIn) {
    return (
      <EmptyState
        kind="vase"
        heading="Nothing saved yet"
        line="Sign in to keep a list of pieces you like."
        actionLabel="Sign in"
        onAction={onSignIn}
      />
    );
  }
  return (
    <EmptyState
      kind="vase"
      heading="Nothing saved yet"
      line="Tap the heart on any piece to keep it here."
      actionLabel="Browse pieces"
      actionHref="/products"
    />
  );
}
