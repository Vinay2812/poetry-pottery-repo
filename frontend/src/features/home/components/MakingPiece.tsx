import { cn } from "@/lib/utils";

import {
  CLAY_RIDGES,
  CLAY_WEDGE,
  JAR_FOOT,
  JAR_FOOT_CONTACT,
  JAR_LEFT_WALL,
  JAR_MOUTH,
  JAR_MOUTH_CRESCENT,
  JAR_MOUTH_INNER,
  JAR_RIGHT_WALL,
  TRIM_CURLS,
} from "@/features/home/components/jar";
import {
  BODY_PATH,
  DENT_PATH,
  GLAZE_BAND_PATH,
  GLAZE_DRIP_PATH,
  GLAZE_TOP_PATH,
  GROUND_Y,
} from "@/features/home/components/jar-surface";
import { MAKING_STEPS } from "@/features/home/types";

export interface MakingPieceProps {
  step: number;
}

const GROUND_PATH = `M104 ${GROUND_Y}C160 ${GROUND_Y - 2.5} 244 ${GROUND_Y + 2.5} 300 ${GROUND_Y - 0.5}`;
const VERSE_ARC = "M136 342C172 350 228 350 264 342";

const STAGGER_MS = 80;
const STAGGER_CAP = 5;

// Only what is new to a step animates; the rest arrives with the crossfade.
function drawStyle(order: number): React.CSSProperties {
  return {
    "--draw-length": 1,
    "--draw-delay": `${Math.min(order, STAGGER_CAP) * STAGGER_MS}ms`,
  } as React.CSSProperties;
}

function fadeStyle(order: number): React.CSSProperties {
  return {
    "--label-delay": `${Math.min(order, STAGGER_CAP) * STAGGER_MS}ms`,
  } as React.CSSProperties;
}

interface StrokeProps {
  d: string;
  order?: number;
  strokeWidth?: number;
  strokeOpacity?: number;
  className?: string;
}

function Stroke({
  d,
  order,
  strokeWidth,
  strokeOpacity,
  className,
}: StrokeProps) {
  const isNew = order !== undefined;
  return (
    <path
      d={d}
      pathLength={1}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      className={cn(isNew && "story-draw", className)}
      style={isNew ? drawStyle(order) : undefined}
    />
  );
}

interface LightProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The lit side and the turn into shadow, painted inside whatever clips them. */
function Light({ x, y, width, height }: LightProps) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="url(#making-highlight)"
        stroke="none"
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="url(#making-terminator)"
        stroke="none"
      />
    </>
  );
}

function Shadow({ scale }: { scale: number }) {
  return (
    <g stroke="none" fill="currentColor">
      <ellipse cx={208} cy={317} rx={76 * scale} ry={7.5} fillOpacity={0.045} />
      <ellipse cx={206} cy={317} rx={56 * scale} ry={6} fillOpacity={0.05} />
      <ellipse
        cx={204}
        cy={316.5}
        rx={38 * scale}
        ry={4.6}
        fillOpacity={0.06}
      />
    </g>
  );
}

/** A lump of wedged clay: the same light and clay as the jar it becomes. */
function Wedge() {
  return (
    <>
      <path
        d={CLAY_WEDGE}
        fill="url(#making-clay)"
        stroke="none"
        className="story-fade"
        style={fadeStyle(1)}
      />
      <g
        clipPath="url(#making-wedge)"
        className="story-fade"
        style={fadeStyle(2)}
      >
        <Light x={140} y={246} width={126} height={78} />
        <g fill="none" stroke="#6F6A62" strokeWidth={0.7}>
          {CLAY_RIDGES.map((d) => (
            <path key={d} d={d} strokeOpacity={0.32} />
          ))}
        </g>
      </g>
      <Stroke d={CLAY_WEDGE} strokeWidth={1} order={0} />
    </>
  );
}

/**
 * The moon jar at one moment of its making, in the hero's coordinate space and
 * the hero's finish, so the silhouette holds still while the states crossfade.
 */
export function MakingPiece({ step }: MakingPieceProps) {
  const isWedge = step === 0;
  const isWarm = step === 3 || step === 4;
  const isThrown = step === 1;
  const hasFoot = step >= 2;
  const hasGlaze = step >= 4;
  const isFinished = step === 5;

  return (
    <svg
      viewBox="92 70 220 296"
      role="img"
      aria-label={MAKING_STEPS[step]?.drawing ?? ""}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-full", isWarm ? "text-kiln" : "text-ink")}
    >
      {/* The bench the whole story happens on: never moves between steps. */}
      <g className="text-ink">
        <Shadow scale={isWedge ? 0.62 : 1} />
      </g>
      <Stroke
        d={GROUND_PATH}
        strokeWidth={0.75}
        strokeOpacity={0.65}
        order={isWedge ? 0 : undefined}
        className="text-ink"
      />

      {isWedge ? (
        <Wedge />
      ) : (
        <>
          <path
            d={BODY_PATH}
            fill={isWarm ? "url(#making-bisque)" : "url(#making-clay)"}
            stroke="none"
            className={isThrown ? "story-fade" : undefined}
            style={isThrown ? fadeStyle(1) : undefined}
          />

          <g clipPath="url(#making-body)">
            {isFinished && (
              <rect
                x={104}
                y={82}
                width={192}
                height={238}
                filter="url(#making-grain)"
                opacity={0.16}
                style={{ mixBlendMode: "multiply" }}
                className="story-fade"
              />
            )}

            <g
              className={isThrown ? "story-fade" : undefined}
              style={isThrown ? fadeStyle(2) : undefined}
            >
              <Light x={104} y={80} width={192} height={240} />
              <use href="#making-rings" />
              <use href="#making-hatch" />
              <path d={DENT_PATH} strokeWidth={0.8} strokeOpacity={0.6} />
            </g>

            {/* Where the trimmed foot presses into the floor. */}
            {hasFoot && (
              <path
                d={JAR_FOOT_CONTACT}
                strokeWidth={2.6}
                strokeOpacity={0.22}
                className={cn("text-ink", step === 2 && "story-fade")}
              />
            )}

            {/* The glaze: a wash that crawled as it dried, and one drip. */}
            {hasGlaze && (
              <>
                <g className={step === 4 ? "story-glaze" : undefined}>
                  <path
                    d={GLAZE_BAND_PATH}
                    fill="#4F6F52"
                    fillOpacity={0.68}
                    stroke="none"
                  />
                  <path
                    d={GLAZE_TOP_PATH}
                    stroke="#F7F4EF"
                    strokeOpacity={0.55}
                    strokeWidth={0.9}
                  />
                </g>
                <path
                  d={GLAZE_DRIP_PATH}
                  fill="#4F6F52"
                  fillOpacity={0.75}
                  stroke="none"
                  className={step === 4 ? "story-fade" : undefined}
                  style={step === 4 ? fadeStyle(4) : undefined}
                />
              </>
            )}
          </g>

          {/* The mouth: the rim band, the dark inside, the far inner wall. */}
          <g
            className={isThrown ? "story-fade" : undefined}
            style={isThrown ? fadeStyle(3) : undefined}
          >
            <path
              d={JAR_MOUTH}
              fill={isWarm ? "url(#making-bisque)" : "url(#making-clay)"}
              stroke="none"
            />
            <path d={JAR_MOUTH_INNER} fill="url(#making-mouth)" stroke="none" />
            <path
              d={JAR_MOUTH_CRESCENT}
              fill="#4F4840"
              fillOpacity={0.26}
              stroke="none"
            />
          </g>

          <g strokeWidth={1}>
            <Stroke d={JAR_LEFT_WALL} order={isThrown ? 0 : undefined} />
            <Stroke d={JAR_RIGHT_WALL} order={isThrown ? 0 : undefined} />
            <Stroke d={JAR_FOOT} order={isThrown ? 1 : undefined} />
            <Stroke d={JAR_MOUTH} order={isThrown ? 2 : undefined} />
            <Stroke
              d={JAR_MOUTH_INNER}
              strokeWidth={0.7}
              strokeOpacity={0.55}
              order={isThrown ? 3 : undefined}
            />
          </g>
        </>
      )}

      {/* Trimmings, only while they are still on the bench. */}
      {step === 2 && (
        <g className="text-ink">
          {TRIM_CURLS.map((d, index) => (
            <g key={d}>
              <path d={d} fill="url(#making-clay)" stroke="none" />
              <Stroke
                d={d}
                strokeWidth={0.75}
                strokeOpacity={0.7}
                order={1 + index}
              />
            </g>
          ))}
        </g>
      )}

      {isFinished && (
        <>
          <path id="making-verse-arc" stroke="none" d={VERSE_ARC} />
          <text
            stroke="none"
            className="story-fade fill-smoke font-script italic"
            style={fadeStyle(4)}
            fontSize={14}
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
