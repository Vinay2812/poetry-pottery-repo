import Link from "next/link";

import { HomeBand } from "./HomeBand";

export interface HomeSectionProps {
  title: string;
  note?: string;
  linkHref?: string;
  linkLabel?: string;
  children: React.ReactNode;
}

// A band with one heading, at most one sentence and at most one link.
export function HomeSection({
  title,
  note,
  linkHref,
  linkLabel,
  children,
}: HomeSectionProps) {
  return (
    <HomeBand className="flex flex-col gap-8">
      <div className="flex items-baseline justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl leading-tight tracking-tight md:text-4xl">
            {title}
          </h2>
          {note && (
            <p className="max-w-lg text-[15px] text-pretty text-muted-foreground">
              {note}
            </p>
          )}
        </div>
        {linkHref && linkLabel && (
          <Link
            href={linkHref}
            className="shrink-0 link-underline pb-0.5 text-sm hover:text-primary"
          >
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </HomeBand>
  );
}
