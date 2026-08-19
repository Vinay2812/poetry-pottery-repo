import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

// Clerk Core 3 replaced <SignedIn>/<SignedOut> with <Show when="...">.
export function Header() {
  return (
    <header className="w-full bg-cream">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <span className="font-heading text-lg font-medium tracking-tight text-primary">
          Poetry & Pottery
        </span>
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button size="lg">Sign in</Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
