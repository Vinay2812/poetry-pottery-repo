import { EmptyState } from "@/components/empty/EmptyState";

export interface EmptyCartProps {
  isSignedIn: boolean;
  onSignIn: () => void;
}

export function EmptyCart({ isSignedIn, onSignIn }: EmptyCartProps) {
  if (!isSignedIn) {
    return (
      <EmptyState
        kind="mug"
        heading="Your cart is empty"
        line="Sign in to see the pieces you saved."
        actionLabel="Sign in"
        onAction={onSignIn}
      />
    );
  }
  return (
    <EmptyState
      kind="mug"
      heading="Your cart is empty"
      line="Nothing in here yet."
      actionLabel="Browse pieces"
      actionHref="/products"
    />
  );
}
