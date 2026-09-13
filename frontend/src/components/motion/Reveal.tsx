"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

// Where a browser can drive the fade off scroll position it does, and the
// observer below never starts. Opt in only where the block scrolls normally:
// a pinned panel holds still, so its view progress would too.
function hasViewTimeline() {
  return (
    typeof CSS !== "undefined" && CSS.supports("animation-timeline", "view()")
  );
}

export interface RevealProps {
  delay?: number;
  isGroup?: boolean;
  isScrollLinked?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Fades a section up 12px the first time it scrolls into view, then stays put.
// A group reveal moves nothing itself: it only marks the moment its staggered
// children may start, so a grid runs one observer instead of one per card.
export function Reveal({
  delay = 0,
  isGroup = false,
  isScrollLinked = false,
  className,
  children,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Content renders visible; the class only replays the fade when it scrolls in.
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    if (isScrollLinked && hasViewTimeline()) return;
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
  }, [isScrollLinked]);

  return (
    <div
      ref={ref}
      data-revealed={isVisible ? "" : undefined}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={cn(
        isScrollLinked && "reveal-section",
        isVisible && !isGroup && "animate-fade-up",
        className,
      )}
    >
      {children}
    </div>
  );
}
