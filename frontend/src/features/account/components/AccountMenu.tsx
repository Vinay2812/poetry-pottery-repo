import { ChevronRight, Heart, MapPin, Package, Settings } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export interface AccountMenuProps {
  displayName: string;
  email: string;
  imageUrl: string | null;
  memberSince: string;
  isAdmin: boolean;
  onManageProfile: () => void;
  onSignOut: () => void;
}

const LINKS = [
  {
    href: "/orders",
    label: "Orders",
    hint: "Progress and past orders",
    Icon: Package,
  },
  {
    href: "/wishlist",
    label: "Saved pieces",
    hint: "Everything you hearted",
    Icon: Heart,
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    hint: "Where we deliver",
    Icon: MapPin,
  },
] as const;

export function AccountMenu({
  displayName,
  email,
  imageUrl,
  memberSince,
  isAdmin,
  onManageProfile,
  onSignOut,
}: AccountMenuProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center gap-4">
        <span className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-medium text-primary-foreground">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </span>
        <div className="min-w-0">
          <h1 className="truncate font-heading text-2xl md:text-3xl">
            {displayName}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
          <p className="text-xs text-muted-foreground">
            Member since {memberSince}
          </p>
        </div>
      </div>
      <ul className="overflow-hidden rounded-3xl bg-card shadow-soft">
        {LINKS.map(({ href, label, hint, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-0 hover:bg-primary-light/50"
            >
              <Icon className="size-5 text-primary" />
              <span className="flex-1">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">
                  {hint}
                </span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={onManageProfile}
            className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-primary-light/50"
          >
            <Settings className="size-5 text-primary" />
            <span className="flex-1">
              <span className="block text-sm font-medium">
                Profile and sign-in
              </span>
              <span className="block text-xs text-muted-foreground">
                Name, email, password
              </span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </li>
      </ul>
      {isAdmin && (
        <Button variant="outline" className="rounded-full" asChild>
          <Link href="/dashboard">Open the studio admin</Link>
        </Button>
      )}
      <Button
        variant="ghost"
        className="w-fit rounded-full text-muted-foreground"
        onClick={onSignOut}
      >
        Sign out
      </Button>
    </div>
  );
}
