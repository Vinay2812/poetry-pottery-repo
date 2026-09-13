import {
  JAR_FOOT,
  JAR_LEFT_WALL,
  JAR_MOUTH,
  JAR_RIGHT_WALL,
} from "@/features/home/components/jar";
import {
  ANCHORS,
  BODY_PATH,
  DENT_PATH,
  GLAZE_BAND_PATH,
  GLAZE_DRIP_PATH,
  GLAZE_TOP_PATH,
  GROUND_Y,
  hatchStrokes,
  ringArc,
  throwingRings,
  type Point,
} from "@/features/home/components/jar-surface";
import { cn } from "@/lib/utils";

/** How much of the piece is rendered: line only, clay, or clay with a grain. */
type HeroFinish = "hatching" | "clay" | "grain";

export interface HeroIllustrationProps {
  isAnimated: boolean;
  finish: HeroFinish;
  className?: string;
}

interface HeroLabel {
  text: string;
  note: string;
  anchor: Point;
  direction: 1 | -1;
  rise: 1 | -1;
  length: number;
}

const MOUTH_INNER =
  "M167 93.2C167 87.9 181.8 84.6 200 84.6C218.2 84.6 233 87.9 233 93.2C233 98.5 218.2 101.8 200 101.8C181.8 101.8 167 98.5 167 93.2Z";

// The far inner wall, seen over the rim: what gives the mouth its depth.
const MOUTH_CRESCENT =
  "M167 93.2C167 87.9 181.8 84.6 200 84.6C218.2 84.6 233 87.9 233 93.2C229.6 93.2 229.6 93.2 229.6 93.2C229.6 89.6 216.3 87.4 200 87.4C183.7 87.4 170.4 89.6 170.4 93.2Z";

const LEADER_ANGLE = (25 * Math.PI) / 180;

// One angle for every leader, so the four lines read as a set.
const LABELS: HeroLabel[] = [
  {
    text: "Glaze",
    note: "fired at 1225°C",
    anchor: ANCHORS.glaze,
    direction: 1,
    rise: -1,
    length: 26,
  },
  {
    text: "Handmade",
    note: "no two alike",
    anchor: ANCHORS.dent,
    direction: 1,
    rise: -1,
    length: 14,
  },
  {
    text: "Stoneware",
    note: "one clay body",
    anchor: ANCHORS.wall,
    direction: -1,
    rise: -1,
    length: 30,
  },
  {
    text: "Sangli",
    note: "made in India",
    anchor: ANCHORS.ground,
    direction: -1,
    rise: 1,
    length: 43,
  },
];

const HATCH = hatchStrokes();
const RINGS = throwingRings();
const BANDS = [0, 1, 2, 3];

const OUTLINE_MS = 0;
const FILL_MS = 480;
const HATCH_MS = 620;
const BAND_STAGGER_MS = 150;
const GLAZE_MS = 1160;
const GROUND_MS = 1340;
const LINE_MS = 1480;
const LINE_STAGGER_MS = 80;
const LINE_DURATION_MS = 420;
const LABEL_MS = LINE_MS + LINE_DURATION_MS;

// pathLength normalises each stroke, so one dash spans a path whatever its real length.
function drawStyle(delayMs: number, durationMs?: number): React.CSSProperties {
  return {
    "--draw-length": 1,
    "--draw-delay": `${delayMs}ms`,
    ...(durationMs ? { animationDuration: `${durationMs}ms` } : {}),
  } as React.CSSProperties;
}

function fadeStyle(delayMs: number): React.CSSProperties {
  return { "--label-delay": `${delayMs}ms` } as React.CSSProperties;
}

function leaderEnd({ anchor, direction, rise, length }: HeroLabel): Point {
  return [
    anchor[0] + direction * length * Math.cos(LEADER_ANGLE),
    anchor[1] + rise * length * Math.sin(LEADER_ANGLE),
  ];
}

/**
 * The piece itself: a moon jar with light from the upper left, cross-contour
 * hatching on the shaded wall, a sage glaze band on the shoulder, and the
 * thumb dent that kept it from being symmetrical.
 */
export function HeroIllustration({
  isAnimated,
  finish,
  className,
}: HeroIllustrationProps) {
  const draw = isAnimated ? "animate-draw-line" : undefined;
  const fade = isAnimated ? "animate-label-fade" : undefined;
  const wipe = isAnimated ? "animate-clip-reveal" : undefined;
  const hasClay = finish !== "hatching";
  const clayId = `hero-clay-${finish}`;
  const mouthId = `hero-mouth-${finish}`;
  const highlightId = `hero-highlight-${finish}`;
  const terminatorId = `hero-terminator-${finish}`;
  const bodyClipId = `hero-body-${finish}`;
  const grainId = `hero-grain-${finish}`;

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-labelledby={`${bodyClipId}-title ${bodyClipId}-desc`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-full text-ink", className)}
    >
      <title id={`${bodyClipId}-title`}>A hand-thrown stoneware moon jar</title>
      <desc id={`${bodyClipId}-desc`}>
        Drawing of a moon jar lit from the upper left, shaded with curved
        hatching that follows the body, a sage glaze band across the shoulder
        with one drip, a thumb dent on the right and a soft shadow on the floor.
        Labelled glaze fired at 1225 degrees, handmade, stoneware and Sangli.
      </desc>

      <defs>
        <linearGradient id={clayId} x1="0" y1="0" x2="1" y2="0.55">
          <stop offset="0" stopColor="#F1EBE3" />
          <stop offset="0.22" stopColor="#EDE5DA" />
          <stop offset="0.62" stopColor="#E3D7C8" />
          <stop offset="0.86" stopColor="#DCCFBF" />
          <stop offset="1" stopColor="#D3C3B0" />
        </linearGradient>
        <linearGradient id={mouthId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4F4840" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#9C8F7E" stopOpacity="0.24" />
          <stop offset="1" stopColor="#D6C8B6" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={terminatorId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.5" stopColor="#1F1D1A" stopOpacity="0" />
          <stop offset="1" stopColor="#1F1D1A" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={highlightId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.04" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.2" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="0.46" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <clipPath id={bodyClipId}>
          <path d={BODY_PATH} />
        </clipPath>
        {finish === "grain" && (
          <filter id={grainId} x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves={2}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.55" intercept="-0.12" />
            </feComponentTransfer>
          </filter>
        )}
      </defs>

      {/* The floor, and the shadow the piece drops on it. */}
      <g className={fade} style={fadeStyle(GROUND_MS)}>
        <ellipse
          cx={208}
          cy={317}
          rx={76}
          ry={7.5}
          fill="currentColor"
          fillOpacity={0.045}
          stroke="none"
        />
        <ellipse
          cx={206}
          cy={317}
          rx={56}
          ry={6}
          fill="currentColor"
          fillOpacity={0.05}
          stroke="none"
        />
        <ellipse
          cx={204}
          cy={316.5}
          rx={38}
          ry={4.6}
          fill="currentColor"
          fillOpacity={0.06}
          stroke="none"
        />
      </g>
      <path
        pathLength={1}
        strokeWidth={0.75}
        strokeOpacity={0.65}
        style={drawStyle(GROUND_MS)}
        className={draw}
        d={`M104 ${GROUND_Y}C160 ${GROUND_Y - 2.5} 244 ${GROUND_Y + 2.5} 300 ${GROUND_Y - 0.5}`}
      />

      {/* The clay body, and everything painted on its surface. */}
      {hasClay && (
        <path
          d={BODY_PATH}
          fill={`url(#${clayId})`}
          stroke="none"
          className={fade}
          style={fadeStyle(FILL_MS)}
        />
      )}

      <g clipPath={`url(#${bodyClipId})`}>
        {finish === "grain" && (
          <rect
            x="80"
            y="70"
            width="240"
            height="260"
            filter={`url(#${grainId})`}
            opacity={0.16}
            className={fade}
            style={{ mixBlendMode: "multiply", ...fadeStyle(FILL_MS) }}
          />
        )}

        {hasClay && (
          <rect
            x="100"
            y="80"
            width="200"
            height="240"
            fill={`url(#${highlightId})`}
            stroke="none"
            className={fade}
            style={fadeStyle(FILL_MS)}
          />
        )}

        {hasClay && (
          <rect
            x="100"
            y="80"
            width="200"
            height="240"
            fill={`url(#${terminatorId})`}
            stroke="none"
            className={fade}
            style={fadeStyle(FILL_MS)}
          />
        )}

        <g
          className={cn("text-smoke", fade)}
          style={fadeStyle(HATCH_MS + BAND_STAGGER_MS)}
          strokeWidth={0.85}
        >
          {RINGS.map((ring) => (
            <path key={ring.d} d={ring.d} strokeOpacity={ring.opacity} />
          ))}
        </g>

        {BANDS.map((band) => (
          <g
            key={band}
            className={cn("text-smoke", fade)}
            style={fadeStyle(HATCH_MS + band * BAND_STAGGER_MS)}
            strokeWidth={0.6}
          >
            {HATCH.filter((stroke) => stroke.band === band).map((stroke) => (
              <path
                key={stroke.d}
                d={stroke.d}
                strokeOpacity={stroke.opacity}
              />
            ))}
          </g>
        ))}

        {/* The glaze: a translucent wash that crawled as it dried. */}
        <g className={wipe} style={{ animationDelay: `${GLAZE_MS}ms` }}>
          <path
            d={GLAZE_BAND_PATH}
            fill="#4F6F52"
            fillOpacity={0.68}
            stroke="none"
          />
          <path
            d={GLAZE_DRIP_PATH}
            fill="#4F6F52"
            fillOpacity={0.75}
            stroke="none"
          />
          <path
            d={GLAZE_TOP_PATH}
            stroke="#F7F4EF"
            strokeOpacity={0.55}
            strokeWidth={0.9}
          />
        </g>

        {/* Where the foot meets the floor, and the thumb press on the shoulder. */}
        <path
          d={ringArc(306, 0.3, 2.45, 1)}
          stroke="currentColor"
          strokeOpacity={0.22}
          strokeWidth={2.6}
          className={fade}
          style={fadeStyle(GROUND_MS)}
        />
        <path
          d={DENT_PATH}
          strokeWidth={0.8}
          strokeOpacity={0.6}
          className={fade}
          style={fadeStyle(HATCH_MS + 3 * BAND_STAGGER_MS)}
        />
      </g>

      {/* The mouth: the rim band, the dark inside, and the far inner wall. */}
      <g className={fade} style={fadeStyle(FILL_MS)}>
        {hasClay && (
          <path d={JAR_MOUTH} fill={`url(#${clayId})`} stroke="none" />
        )}
        <path d={MOUTH_INNER} fill={`url(#${mouthId})`} stroke="none" />
        <path
          d={MOUTH_CRESCENT}
          fill="#4F4840"
          fillOpacity={0.26}
          stroke="none"
        />
      </g>

      {/* The outline, drawn first: two walls, the foot, the rim, its inner edge. */}
      <g strokeWidth={1}>
        <path
          pathLength={1}
          style={drawStyle(OUTLINE_MS)}
          className={draw}
          d={JAR_LEFT_WALL}
        />
        <path
          pathLength={1}
          style={drawStyle(OUTLINE_MS)}
          className={draw}
          d={JAR_RIGHT_WALL}
        />
        <path
          pathLength={1}
          style={drawStyle(OUTLINE_MS + 260)}
          className={draw}
          d={JAR_FOOT}
        />
        <path
          pathLength={1}
          style={drawStyle(OUTLINE_MS + 320)}
          className={draw}
          d={JAR_MOUTH}
        />
        <path
          pathLength={1}
          strokeWidth={0.7}
          strokeOpacity={0.55}
          style={drawStyle(OUTLINE_MS + 400)}
          className={draw}
          d={MOUTH_INNER}
        />
      </g>

      {/* The studio's line, under the piece. */}
      <path
        id={`${bodyClipId}-verse`}
        stroke="none"
        d="M134 376C172 382 228 382 266 376"
      />
      <text
        stroke="none"
        className={cn("fill-smoke font-script italic", fade)}
        style={fadeStyle(LABEL_MS + 520)}
        fontSize={15}
      >
        <textPath
          href={`#${bodyClipId}-verse`}
          startOffset="50%"
          textAnchor="middle"
        >
          where clay meets verses
        </textPath>
      </text>

      {/* Kiln labels: one angle, a dot on the surface, then the claim. */}
      <g>
        {LABELS.map((label, index) => {
          const end = leaderEnd(label);
          const isRight = label.direction === 1;
          return (
            <g key={label.text}>
              <path
                d={`M${end[0].toFixed(1)} ${end[1].toFixed(1)}L${label.anchor[0].toFixed(1)} ${label.anchor[1].toFixed(1)}`}
                pathLength={1}
                strokeWidth={0.75}
                style={drawStyle(
                  LINE_MS + index * LINE_STAGGER_MS,
                  LINE_DURATION_MS,
                )}
                className={draw}
              />
              <circle
                cx={label.anchor[0]}
                cy={label.anchor[1]}
                r={1.9}
                fill="currentColor"
                stroke="none"
                className={fade}
                style={fadeStyle(
                  LINE_MS + index * LINE_STAGGER_MS + LINE_DURATION_MS,
                )}
              />
              <text
                x={end[0] + (isRight ? 7 : -7)}
                y={end[1] - 4}
                textAnchor={isRight ? "start" : "end"}
                fontSize={11.5}
                letterSpacing={1.5}
                stroke="none"
                className={cn("fill-ink font-sans uppercase", fade)}
                style={fadeStyle(LABEL_MS + index * LINE_STAGGER_MS)}
              >
                {label.text}
              </text>
              <text
                x={end[0] + (isRight ? 7 : -7)}
                y={end[1] + 12}
                textAnchor={isRight ? "start" : "end"}
                fontSize={12.5}
                stroke="none"
                className={cn("fill-smoke font-script italic", fade)}
                style={fadeStyle(LABEL_MS + index * LINE_STAGGER_MS + 80)}
              >
                {label.note}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
