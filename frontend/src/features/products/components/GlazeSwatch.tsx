import Image from "next/image";
import { useId } from "react";

import { washSquare } from "@/lib/drawing/wash";
import { cn } from "@/lib/utils";

export interface GlazeSwatchProps {
  name: string;
  colorCode: string | null;
  swatchUrl?: string | null;
  size?: "sm" | "lg";
  className?: string;
}

const BOX = 100;

// A test tile, not a colour chip: the glaze is painted on clay, crawls where it
// stopped and hangs one drip, the same way it does on the hero jar.
export function GlazeSwatch({
  name,
  colorCode,
  swatchUrl = null,
  size = "lg",
  className,
}: GlazeSwatchProps) {
  const id = useId();
  const wash = washSquare(BOX, BOX, 4471);
  const box = size === "sm" ? "size-3" : "size-16";

  if (swatchUrl) {
    return (
      <span className={cn("relative block shrink-0 bg-white", box, className)}>
        <Image
          src={swatchUrl}
          alt={`${name} glaze`}
          fill
          sizes="64px"
          className="object-cover"
        />
      </span>
    );
  }

  if (!colorCode) return null;

  if (size === "sm") {
    return (
      <span
        aria-hidden="true"
        style={{ backgroundColor: colorCode }}
        className={cn("block size-3 shrink-0", className)}
      />
    );
  }

  return (
    <svg
      viewBox={`0 0 ${BOX} ${BOX}`}
      role="img"
      className={cn("block size-16 shrink-0 bg-clay-white", className)}
    >
      <title>{`${name}, painted on clay`}</title>
      <defs>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#1F1D1A" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <path d={wash.glaze} fill={colorCode} />
      <path d={wash.drip} fill={colorCode} fillOpacity={0.85} />
      <path d={wash.crawl} fill="none" stroke={colorCode} strokeWidth={2.4} />
      <rect width={BOX} height={BOX} fill={`url(#${id}-light)`} />
    </svg>
  );
}
