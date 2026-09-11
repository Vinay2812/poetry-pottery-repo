import Link from "next/link";

import { Button } from "@/components/ui/button";

export interface EmptyWishlistProps {
  isSignedIn: boolean;
  onSignIn: () => void;
}

export function EmptyWishlist({ isSignedIn, onSignIn }: EmptyWishlistProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-cream px-6 py-16 text-center">
      <p className="font-script text-3xl text-clay-dark italic">
        Nothing saved yet
      </p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {isSignedIn
          ? "Tap the heart on any piece to keep it here for later."
          : "Sign in to keep a list of pieces you like across your devices."}
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
