export interface AboutSectionProps {
  heading: string;
  children: React.ReactNode;
}

// Full-bleed hairline above, one eyebrow heading, then whatever the CMS gave us.
export function AboutSection({ heading, children }: AboutSectionProps) {
  return (
    <section className="border-t border-ash py-12 md:py-20">
      <div className="flex flex-col gap-8 md:gap-10">
        <h2 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          {heading}
        </h2>
        {children}
      </div>
    </section>
  );
}
