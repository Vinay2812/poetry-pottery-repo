import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";

export interface SignInWallProps {
  message: string;
  onSignIn: () => void;
}

export function SignInWall({ message, onSignIn }: SignInWallProps) {
  return (
    <PageShell
      column="narrow"
      className="flex flex-col items-start gap-4 border-t border-ash py-16"
    >
      {/* This is the whole page when it renders, so it carries the page heading. */}
      <h1 className="font-heading text-2xl tracking-tight">{message}</h1>
      <Button variant="outline" onClick={onSignIn}>
        Sign in
      </Button>
    </PageShell>
  );
}
