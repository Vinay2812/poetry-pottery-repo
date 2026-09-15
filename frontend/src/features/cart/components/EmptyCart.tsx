import Link from "next/link";

import { Button } from "@/components/ui/button";

export interface EmptyCartProps {
  isSignedIn: boolean;
  onSignIn: () => void;
}

export function EmptyCart({ isSignedIn, onSignIn }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">
        Your cart is empty
      </h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        {isSignedIn
          ? "Nothing in here yet."
          : "Sign in to see the pieces you saved."}
      </p>
      <div className="flex gap-3">
        {!isSignedIn && (
          <Button variant="outline" onClick={onSignIn}>
            Sign in
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/products">Browse pieces</Link>
        </Button>
      </div>
    </div>
  );
}
