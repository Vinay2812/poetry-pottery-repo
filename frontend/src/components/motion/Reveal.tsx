"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface RevealProps {
  delay?: number;
  isGroup?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Fades a section up 12px the first time it scrolls into view, then stays put.
// A group reveal moves nothing itself: it only marks the moment its staggered
// children may start, so a grid runs one observer instead of one per card.
export function Reveal({
  delay = 0,
  isGroup = false,
  className,
  children,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Content renders visible; the class only replays the fade when it scrolls in.
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-revealed={isVisible ? "" : undefined}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={cn(isVisible && !isGroup && "animate-fade-up", className)}
    >
      {children}
    </div>
  );
}
