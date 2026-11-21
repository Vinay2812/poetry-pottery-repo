import { Reveal } from "@/components/motion/Reveal";

export interface HomeBandProps {
  isGroup?: boolean;
  className?: string;
  children: React.ReactNode;
}

// One room of the home page: a full-bleed hairline above, generous air around.
// A group band only starts its children's stagger; a plain band fades as one.
export function HomeBand({
  isGroup = false,
  className,
  children,
}: HomeBandProps) {
  return (
    <section className="border-t border-ash py-16 md:py-24">
      <Reveal isGroup={isGroup} isScrollLinked={!isGroup} className={className}>
        {children}
      </Reveal>
    </section>
  );
}
