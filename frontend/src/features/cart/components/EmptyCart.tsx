import Link from "next/link";

import { Button } from "@/components/ui/button";

export interface EmptyCartProps {
  isSignedIn: boolean;
  onSignIn: () => void;
}

export function EmptyCart({ isSignedIn, onSignIn }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-cream px-6 py-16 text-center">
      <p className="font-script text-3xl text-clay-dark italic">
        Your cart is empty
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {isSignedIn
          ? "Nothing in here yet. The shelf is full, though."
          : "Sign in to see pieces you have saved, or start browsing the shelf."}
      </p>
      <div className="flex gap-3">
        {!isSignedIn && (
          <Button variant="outline" className="rounded-full" onClick={onSignIn}>
            Sign in
          </Button>
        )}
        <Button className="rounded-full" asChild>
          <Link href="/products">Browse pieces</Link>
        </Button>
      </div>
    </div>
  );
}
