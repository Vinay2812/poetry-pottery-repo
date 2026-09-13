"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface RevealProps {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

// Fades a section up 12px the first time it scrolls into view, then stays put.
export function Reveal({ delay = 0, className, children }: RevealProps) {
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
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={cn(isVisible && "animate-fade-up", className)}
    >
      {children}
    </div>
  );
}
