import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";

export interface HomeSectionProps {
  title: string;
  note?: string;
  linkHref?: string;
  linkLabel?: string;
  children: React.ReactNode;
}

// Full-bleed hairline, generous padding, one heading and at most one sentence.
export function HomeSection({
  title,
  note,
  linkHref,
  linkLabel,
  children,
}: HomeSectionProps) {
  return (
    <section className="border-t border-ash py-16 md:py-24">
      <Reveal isScrollLinked className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl leading-tight tracking-tight md:text-4xl">
              {title}
            </h2>
            {note && (
              <p className="max-w-lg text-[15px] text-muted-foreground">
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
      </Reveal>
    </section>
  );
}
