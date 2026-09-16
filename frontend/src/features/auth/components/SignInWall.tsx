import { Button } from "@/components/ui/button";

export interface SignInWallProps {
  message: string;
  onSignIn: () => void;
}

export function SignInWall({ message, onSignIn }: SignInWallProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 border-t border-ash px-4 py-16 md:px-8">
      {/* This is the whole page when it renders, so it carries the page heading. */}
      <h1 className="font-heading text-2xl tracking-tight">{message}</h1>
      <Button variant="outline" onClick={onSignIn}>
        Sign in
      </Button>
    </div>
  );
}
