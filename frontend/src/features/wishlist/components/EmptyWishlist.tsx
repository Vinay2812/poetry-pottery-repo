import Link from "next/link";

import { Button } from "@/components/ui/button";

export interface EmptyWishlistProps {
  isSignedIn: boolean;
  onSignIn: () => void;
}

export function EmptyWishlist({ isSignedIn, onSignIn }: EmptyWishlistProps) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ash py-16">
      <h2 className="font-heading text-2xl tracking-tight">
        Nothing saved yet
      </h2>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        {isSignedIn
          ? "Tap the heart on any piece to keep it here."
          : "Sign in to keep a list of pieces you like."}
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
