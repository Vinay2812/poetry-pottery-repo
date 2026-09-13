import { Children } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { toRevealDelay } from "@/components/motion/stagger";

export interface ProductGridProps {
  children: React.ReactNode;
}

export function ProductGrid({ children }: ProductGridProps) {
  return (
    <Reveal
      isGroup
      className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 xl:grid-cols-4"
    >
      {Children.map(children, (child, index) => (
        <div className="reveal-item" style={toRevealDelay(index)}>
          {child}
        </div>
      ))}
    </Reveal>
  );
}
