import Image from "next/image";

import { cn } from "@/lib/utils";

type Point = [number, number];

export interface HeroIllustrationProps {
  isAnimated: boolean;
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

const LEADER_ANGLE = (25 * Math.PI) / 180;

// The render is 1600px square; it sits in the 400-unit label square at this offset and size.
const RENDER_PX = 1600;
const RENDER_BOX = { left: 30, top: 8, size: 340 } as const;

function onRender(x: number, y: number): Point {
  const scale = RENDER_BOX.size / RENDER_PX;
  return [RENDER_BOX.left + x * scale, RENDER_BOX.top + y * scale];
}

// Anchors are points on the vase in render pixels; each upper pair shares a baseline.
const LABELS: HeroLabel[] = [
  {
    text: "Carved",
    note: "by hand, line by line",
    anchor: onRender(1020, 712),
    direction: 1,
    rise: -1,
    length: 36,
  },
  {
    text: "Handmade",
    note: "no two alike",
    anchor: onRender(948, 1256),
    direction: 1,
    rise: -1,
    length: 54,
  },
  {
    text: "Stoneware",
    note: "one clay body",
    anchor: onRender(471, 712),
    direction: -1,
    rise: -1,
    length: 36,
  },
  {
    text: "Sangli",
    note: "made in India",
    anchor: onRender(612, 1409),
    direction: -1,
    rise: -1,
    length: 30,
  },
];

const IMAGE_MS = 0;
const LINE_MS = 700;
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
 * The studio's two-handled vase, rendered from one of its own pieces, with
 * kiln labels drawn out to the carving, the clay, the hand and the place.
 */
export function HeroIllustration({
  isAnimated,
  className,
}: HeroIllustrationProps) {
  const draw = isAnimated ? "animate-draw-line" : undefined;
  const fade = isAnimated ? "animate-label-fade" : undefined;

  return (
    <div className={cn("relative size-full text-ink", className)}>
      {/* The piece sits inset so the labels have room on either side. */}
      <div
        className={cn("absolute top-[2%] left-[7.5%] size-[85%]", fade)}
        style={fadeStyle(IMAGE_MS)}
      >
        <Image
          src="/home/amphora.webp"
          alt="A hand-thrown two-handled clay vase with carved diagonal grooves, a wavy lip and a band of scrolls above its foot"
          fill
          sizes="(min-width: 768px) 43vw, 85vw"
          loading="eager"
          fetchPriority="high"
          className="object-contain"
        />
      </div>

      <svg
        viewBox="0 0 400 400"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        className="absolute inset-0 size-full"
      >
        {/* The studio's line, under the piece. */}
        <path
          id="hero-verse"
          stroke="none"
          d="M100 346C160 349 240 349 300 346"
        />
        <text
          stroke="none"
          className={cn(
            "fill-smoke font-script text-[15px] italic max-sm:text-[17px]",
            fade,
          )}
          style={fadeStyle(LABEL_MS + 520)}
        >
          <textPath href="#hero-verse" startOffset="50%" textAnchor="middle">
            where clay meets verses
          </textPath>
        </text>

        {/* Kiln labels: one angle, a dot on the surface, then the claim. */}
        {LABELS.map((label, index) => {
          const end = leaderEnd(label);
          const isRight = label.direction === 1;
          return (
            <g key={label.text}>
              <path
                d={`M${end[0].toFixed(1)} ${end[1].toFixed(1)}L${label.anchor[0].toFixed(1)} ${label.anchor[1].toFixed(1)}`}
                pathLength={1}
                strokeWidth={1}
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
                letterSpacing={1.5}
                stroke="none"
                // Phones shrink the square, so the caps grow there to stay readable.
                className={cn(
                  "fill-ink font-sans text-[12.5px] uppercase sm:text-[11.5px]",
                  fade,
                )}
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
                className={cn(
                  "fill-smoke font-script italic max-sm:hidden",
                  fade,
                )}
                style={fadeStyle(LABEL_MS + index * LINE_STAGGER_MS + 80)}
              >
                {label.note}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
