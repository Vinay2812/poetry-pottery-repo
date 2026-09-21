import Link from "next/link";

import { Wordmark } from "@/components/brand/Wordmark";

export interface AdminTopBarProps {
  adminName: string;
  adminEmail: string;
  adminImageUrl: string | null;
  shopHref: string;
}

export function AdminTopBar({
  adminName,
  adminEmail,
  adminImageUrl,
  shopHref,
}: AdminTopBarProps) {
  return (
    <header
      data-admin-chrome
      className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-ash bg-background px-4 md:px-6"
    >
      <Link href="/dashboard" className="inline-flex shrink-0 items-center">
        <Wordmark className="h-[18px]" />
      </Link>
      <span className="hidden h-5 w-px bg-ash md:block" />
      <span className="hidden text-[11px] tracking-[0.18em] text-muted-foreground uppercase md:block">
        Studio admin
      </span>
      <div className="ml-auto flex items-center gap-4">
        <Link
          href={shopHref}
          className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          View shop
        </Link>
        <span className="flex items-center gap-2">
          {adminImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={adminImageUrl}
              alt=""
              className="size-7 rounded-full object-cover"
            />
          ) : null}
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[13px]">{adminName}</span>
            <span className="text-[11px] text-muted-foreground">
              {adminEmail}
            </span>
          </span>
        </span>
      </div>
    </header>
  );
}
