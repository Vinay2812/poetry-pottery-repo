"use client";

import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

export interface KilnLabel {
  text: string;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
}

export interface KilnLabelsProps {
  labels: KilnLabel[];
  isAnimated: boolean;
  className?: string;
}

const LINE_MS = 120;
const LINE_DURATION_MS = 600;
// User units in a 100x100 box: keeps the rule a hairline at every container width.
const STROKE_WIDTH = 0.22;

// The one signature device: thin lines drawn from a piece out to short labels.
export function KilnLabels({ labels, isAnimated, className }: KilnLabelsProps) {
  const [drawnIndexes, setDrawnIndexes] = useState<number[]>([]);

  // Once a line has finished drawing its dash pattern comes off, so it stays continuous.
  const handleDrawn = useCallback((index: number) => {
    setDrawnIndexes((current) =>
      current.includes(index) ? current : [...current, index],
    );
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        {labels.map((label, index) => {
          const isDrawing = isAnimated && !drawnIndexes.includes(index);
          const length = Math.hypot(
            label.x - label.anchorX,
            label.y - label.anchorY,
          );
          return (
            <g key={label.text}>
              <line
                x1={label.anchorX}
                y1={label.anchorY}
                x2={label.x}
                y2={label.y}
                stroke="currentColor"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                style={
                  {
                    "--draw-length": length,
                    "--draw-delay": `${index * LINE_MS}ms`,
                  } as React.CSSProperties
                }
                className={isDrawing ? "animate-draw-line" : undefined}
                onAnimationEnd={() => handleDrawn(index)}
              />
              <circle
                cx={label.anchorX}
                cy={label.anchorY}
                r={0.7}
                fill="currentColor"
              />
            </g>
          );
        })}
      </svg>
      {labels.map((label, index) => (
        <span
          key={label.text}
          style={
            {
              left: `${label.x}%`,
              top: `${label.y}%`,
              "--label-delay": `${index * LINE_MS + LINE_DURATION_MS}ms`,
            } as React.CSSProperties
          }
          className={cn(
            "absolute -translate-y-1/2 text-[11px] tracking-[0.18em] whitespace-nowrap uppercase",
            label.x >= 50 ? "ml-2" : "-ml-2 -translate-x-full",
            isAnimated && "animate-label-fade",
          )}
        >
          {label.text}
        </span>
      ))}
    </div>
  );
}
