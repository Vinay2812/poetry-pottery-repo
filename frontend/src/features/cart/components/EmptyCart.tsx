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
        heading="Sign in to see your cart"
        line="Your cart is kept with your account, so it follows you to any device."
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
