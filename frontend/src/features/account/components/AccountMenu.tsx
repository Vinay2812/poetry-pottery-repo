import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/PageShell";

import { toInitials } from "@/features/account/types";

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
  { href: "/orders", label: "Orders", hint: "Progress and past orders" },
  {
    href: "/registrations",
    label: "Bookings",
    hint: "Workshops and open mics",
  },
  {
    href: "/workshops/bookings",
    label: "Wheel sessions",
    hint: "Your studio bookings",
  },
  { href: "/wishlist", label: "Saved pieces", hint: "Pieces you kept" },
  {
    href: "/account/addresses",
    label: "Addresses",
    hint: "Where we deliver",
  },
] as const;

const ROW =
  "flex items-center justify-between gap-4 border-b border-ash py-4 text-left transition-colors duration-200 hover:text-primary";

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
    <PageShell column="narrow" className="flex flex-col gap-8 py-8 md:py-12">
      <div className="flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-xl tracking-wide text-white">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            toInitials(displayName)
          )}
        </span>
        <div className="min-w-0">
          <h1 className="font-heading text-2xl tracking-tight md:text-3xl">
            Your account
          </h1>
          <p className="truncate text-sm">{displayName}</p>
          <p className="truncate text-[13px] text-muted-foreground">
            {email} · with us since {memberSince}
          </p>
        </div>
      </div>
      <ul className="flex flex-col border-t border-ash">
        {LINKS.map(({ href, label, hint }) => (
          <li key={href}>
            <Link href={href} className={ROW}>
              <span className="text-[15px]">{label}</span>
              <span className="flex items-center gap-3">
                <span className="text-[13px] text-muted-foreground">
                  {hint}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </span>
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={onManageProfile}
            className={`w-full ${ROW}`}
          >
            <span className="text-[15px]">Profile and sign-in</span>
            <span className="flex items-center gap-3">
              <span className="text-[13px] text-muted-foreground">
                Name, email, password
              </span>
              <ArrowRight
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.5}
              />
            </span>
          </button>
        </li>
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        {isAdmin && (
          <Button variant="outline" asChild>
            <Link href="/dashboard">Open the studio admin</Link>
          </Button>
        )}
        <button
          type="button"
          onClick={onSignOut}
          className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Sign out
        </button>
      </div>
    </PageShell>
  );
}
