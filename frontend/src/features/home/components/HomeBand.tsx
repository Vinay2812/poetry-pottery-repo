import { Reveal } from "@/components/motion/Reveal";

export interface HomeBandProps {
  isGroup?: boolean;
  className?: string;
  children: React.ReactNode;
}

// A home section under a hairline; a group band only starts its children's stagger.
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
