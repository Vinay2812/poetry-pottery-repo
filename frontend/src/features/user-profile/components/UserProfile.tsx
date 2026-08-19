import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface UserProfileProps {
  isLoading: boolean;
  isSignedIn: boolean;
  hasError: boolean;
  displayName: string;
  initial: string;
  email: string;
  roleLabel: string;
  isAdmin: boolean;
  memberSince: string;
  authProviderLabel: string;
  onSignInClick: () => void;
}

export function UserProfile({
  isLoading,
  isSignedIn,
  hasError,
  displayName,
  initial,
  email,
  roleLabel,
  isAdmin,
  memberSince,
  authProviderLabel,
  onSignInClick,
}: UserProfileProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-sm" aria-busy="true">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="size-14 animate-pulse rounded-full bg-primary-light" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-32 animate-pulse rounded-full bg-primary-light" />
              <div className="h-3 w-40 animate-pulse rounded-full bg-primary-light/70" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-3 w-28 animate-pulse rounded-full bg-primary-light/70" />
        </CardContent>
      </Card>
    );
  }

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome to Poetry & Pottery</CardTitle>
          <CardDescription>Sign in to see your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onSignInClick}>Sign in</Button>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Profile unavailable</CardTitle>
          <CardDescription>
            We could not load your profile just now. Please try again shortly.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-medium text-primary-foreground shadow-lg shadow-primary/20"
          >
            {initial}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="truncate text-lg">{displayName}</CardTitle>
            <CardDescription className="truncate">{email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <span
          className={
            isAdmin
              ? "w-fit rounded-full bg-terracotta px-3 py-1 text-xs font-semibold tracking-wide text-foreground uppercase"
              : "w-fit rounded-full bg-primary-light px-3 py-1 text-xs font-medium tracking-wide text-primary-hover uppercase"
          }
        >
          {roleLabel}
        </span>
        <p className="text-xs text-muted-foreground">
          Member since {memberSince} &middot; via {authProviderLabel}
        </p>
      </CardContent>
    </Card>
  );
}
