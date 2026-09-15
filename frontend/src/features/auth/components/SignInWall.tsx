import { Button } from "@/components/ui/button";

export interface SignInWallProps {
  message: string;
  onSignIn: () => void;
}

export function SignInWall({ message, onSignIn }: SignInWallProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center md:px-8">
      <p className="font-script text-3xl text-clay-dark italic">{message}</p>
      <Button className="rounded-full" onClick={onSignIn}>
        Sign in
      </Button>
    </div>
  );
}
