import { cn } from "@/lib/utils";

import {
  CLAY_RIDGES,
  CLAY_WEDGE,
  JAR_FLOOR,
  JAR_FOOT,
  JAR_FOOT_RING,
  JAR_GLAZE_BAND,
  JAR_GLAZE_DRIP,
  JAR_KILN_MARK,
  JAR_LEFT_WALL,
  JAR_MOUTH,
  JAR_RIGHT_WALL,
  JAR_RINGS,
  JAR_SHADOW,
  JAR_THUMB_DENT,
  JAR_VERSE_ARC,
  TRIM_CURLS,
} from "@/features/home/components/jar";
import { MAKING_STEPS } from "@/features/home/types";

export interface MakingPieceProps {
  step: number;
}

const STAGGER_MS = 80;
const STAGGER_CAP = 5;

// Only strokes new to a step draw themselves, staggered and capped at five.
function drawStyle(order: number): React.CSSProperties {
  return {
    "--draw-length": 1,
    "--draw-delay": `${Math.min(order, STAGGER_CAP) * STAGGER_MS}ms`,
  } as React.CSSProperties;
}

interface StrokeProps {
  d: string;
  order?: number;
  strokeWidth?: number;
  className?: string;
}

function Stroke({ d, order, strokeWidth, className }: StrokeProps) {
  const isNew = order !== undefined;
  return (
    <path
      d={d}
      pathLength={1}
      strokeWidth={strokeWidth}
      className={cn(isNew && "story-draw", className)}
      style={isNew ? drawStyle(order) : undefined}
    />
  );
}

function Profile({ isNew }: { isNew: boolean }) {
  return (
    <g strokeWidth={1}>
      <Stroke d={JAR_LEFT_WALL} order={isNew ? 0 : undefined} />
      <Stroke d={JAR_RIGHT_WALL} order={isNew ? 0 : undefined} />
      <Stroke d={JAR_FOOT} order={isNew ? 1 : undefined} />
      <Stroke d={JAR_MOUTH} order={isNew ? 2 : undefined} />
      <Stroke
        d={JAR_THUMB_DENT}
        strokeWidth={0.8}
        order={isNew ? 5 : undefined}
      />
    </g>
  );
}

function Rings({ isNew }: { isNew: boolean }) {
  return (
    <g strokeWidth={0.8} className="text-smoke">
      {JAR_RINGS.map((d, index) => (
        <Stroke key={d} d={d} order={isNew ? 3 + index : undefined} />
      ))}
    </g>
  );
}

function Glaze({ isNew }: { isNew: boolean }) {
  return (
    <g className="text-sage">
      <g className={isNew ? "story-glaze" : undefined}>
        <path d={JAR_GLAZE_BAND} strokeWidth={1.6} />
      </g>
      <Stroke
        d={JAR_GLAZE_DRIP}
        strokeWidth={1.3}
        order={isNew ? 4 : undefined}
      />
    </g>
  );
}

/**
 * The moon jar at one moment of its making, always in the hero's coordinate
 * space so the silhouette holds still while the states crossfade.
 */
export function MakingPiece({ step }: MakingPieceProps) {
  const isWedge = step === 0;
  const isWarm = step === 3 || step === 4;
  const isFinished = step === 5;

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={MAKING_STEPS[step]?.drawing ?? ""}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-full", isWarm ? "text-kiln" : "text-ink")}
    >
      {/* The bench the whole story happens on: drawn once, never moved. */}
      <Stroke
        d={JAR_FLOOR}
        strokeWidth={0.75}
        order={isWedge ? 0 : undefined}
      />

      {isWedge ? (
        <>
          <Stroke d={CLAY_WEDGE} strokeWidth={1} order={1} />
          <g strokeWidth={0.8} className="text-smoke">
            {CLAY_RIDGES.map((d, index) => (
              <Stroke key={d} d={d} order={2 + index} />
            ))}
          </g>
        </>
      ) : (
        <>
          <Profile isNew={step === 1} />
          <Rings isNew={step === 1} />
          {step >= 2 && (
            <Stroke
              d={JAR_FOOT_RING}
              strokeWidth={0.75}
              order={step === 2 ? 0 : undefined}
            />
          )}
          {step >= 4 && <Glaze isNew={step === 4} />}
        </>
      )}

      {/* Trimmings, only while they are still on the bench. */}
      {step === 2 && (
        <g strokeWidth={0.75} className="text-smoke">
          {TRIM_CURLS.map((d, index) => (
            <Stroke key={d} d={d} order={1 + index} />
          ))}
        </g>
      )}

      {isFinished && (
        <>
          <ellipse
            cx={JAR_SHADOW.cx}
            cy={JAR_SHADOW.cy}
            rx={JAR_SHADOW.rx}
            ry={JAR_SHADOW.ry}
            fill="currentColor"
            fillOpacity={0.07}
            stroke="none"
          />
          <Stroke
            d={JAR_KILN_MARK}
            strokeWidth={0.9}
            order={0}
            className="text-sage"
          />
          <path id="making-verse-arc" stroke="none" d={JAR_VERSE_ARC} />
          <text
            className="story-fade fill-sage font-script italic"
            fontSize={12}
          >
            <textPath
              href="#making-verse-arc"
              startOffset="50%"
              textAnchor="middle"
            >
              where clay meets verses
            </textPath>
          </text>
        </>
      )}
    </svg>
  );
}
