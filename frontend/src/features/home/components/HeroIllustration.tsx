import { cn } from "@/lib/utils";

export interface HeroIllustrationProps {
  isAnimated: boolean;
  className?: string;
}

interface HeroLabel {
  text: string;
  note: string;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  align: "start" | "end";
}

// Every line lands on the part of the piece that carries the claim.
const LABELS: HeroLabel[] = [
  {
    text: "Handmade",
    note: "no two alike",
    x: 310,
    y: 118,
    anchorX: 281,
    anchorY: 156,
    align: "start",
  },
  {
    text: "Stoneware",
    note: "one clay body",
    x: 96,
    y: 152,
    anchorX: 105,
    anchorY: 196,
    align: "end",
  },
  {
    text: "Sangli",
    note: "made in India",
    x: 102,
    y: 296,
    anchorX: 166,
    anchorY: 320,
    align: "end",
  },
  {
    text: "1225°C",
    note: "one kiln",
    x: 302,
    y: 302,
    anchorX: 281,
    anchorY: 305,
    align: "start",
  },
];

// Throwing rings, as ellipse arcs that follow the curve of the wall.
const RINGS = [
  "M140.0 140.0C140.0 150.3 258.8 150.3 258.8 140.0",
  "M126.7 176.0C126.7 188.6 272.1 188.6 272.1 176.0",
  "M125.0 214.0C125.0 227.0 275.1 227.0 275.1 214.0",
  "M130.0 250.0C130.0 262.1 270.0 262.1 270.0 250.0",
];

const DRAW_MS = 600;
const PIECE_MS = 0;
const RINGS_MS = 420;
const GLAZE_MS = 680;
const GROUND_MS = 860;
const LINE_MS = 1000;
const LINE_STAGGER_MS = 80;
const LABEL_MS = LINE_MS + 3 * LINE_STAGGER_MS + DRAW_MS;

// pathLength normalises each stroke, so one dash spans a path whatever its real length.
function drawStyle(delayMs: number): React.CSSProperties {
  return {
    "--draw-length": 1,
    "--draw-delay": `${delayMs}ms`,
  } as React.CSSProperties;
}

function fadeStyle(delayMs: number): React.CSSProperties {
  return { "--label-delay": `${delayMs}ms` } as React.CSSProperties;
}

/**
 * One piece, drawn: a moon jar with the rings of the throwing still on it, a
 * sage glaze band on the shoulder, a thumb dent that breaks its symmetry, and
 * the studio's line carved under the ground it stands on.
 */
export function HeroIllustration({
  isAnimated,
  className,
}: HeroIllustrationProps) {
  const draw = isAnimated ? "animate-draw-line" : undefined;
  const fade = isAnimated ? "animate-label-fade" : undefined;

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-labelledby="hero-illustration-title hero-illustration-desc"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-full text-ink", className)}
    >
      <title id="hero-illustration-title">
        A hand-thrown stoneware moon jar
      </title>
      <desc id="hero-illustration-desc">
        Line drawing of a moon jar standing on a hairline floor, with throwing
        rings across the body, a sage glaze band on the shoulder, a thumb dent
        on one side and a small kiln mark at the foot. Labelled handmade,
        stoneware, Sangli and 1225 degrees.
      </desc>

      {/* The piece: two walls, the foot it stands on, the mouth. */}
      <g strokeWidth={1}>
        <path
          pathLength={1}
          style={drawStyle(PIECE_MS)}
          className={draw}
          d="M162.0 92.0C162.3 94.4 164.4 96.1 163.5 99.0C162.6 101.7 159.1 106.4 156.0 110.0C152.4 113.6 147.7 118.0 143.0 122.0C138.9 126.0 134.6 129.1 130.0 134.0C125.6 138.9 119.7 144.2 116.0 150.0C112.5 155.7 110.2 161.7 108.0 170.0C105.9 178.0 104.3 190.0 104.0 200.0C104.2 210.3 106.1 222.0 108.0 230.0C109.9 238.5 112.6 244.0 116.0 250.0C119.6 256.1 123.4 262.5 128.0 268.0C132.7 273.3 138.1 277.9 142.0 282.0C146.0 285.9 149.6 289.1 152.0 292.0C154.3 295.3 155.0 297.3 155.5 300.0C156.4 303.3 156.0 306.4 156.0 310.0"
        />
        <path
          pathLength={1}
          style={drawStyle(PIECE_MS)}
          className={draw}
          d="M238.0 92.0C237.8 94.7 235.8 96.0 236.5 99.0C237.6 101.8 241.0 106.2 244.0 110.0C247.1 113.5 252.2 118.3 256.1 122.0C260.0 126.2 264.5 129.1 268.9 134.0C273.2 138.9 279.4 143.7 282.7 150.0C286.4 155.7 288.6 161.5 290.6 170.0C293.1 178.7 295.8 190.3 296.0 200.0C296.1 209.7 294.1 221.3 292.0 230.0C289.8 238.3 287.4 243.4 284.0 250.0C280.3 256.6 276.2 263.0 272.0 268.0C267.9 273.2 262.0 278.0 258.0 282.0C254.1 286.1 250.3 289.1 248.0 292.0C246.1 295.0 245.1 297.2 244.5 300.0C243.6 302.9 244.5 306.7 244.0 310.0"
        />
        <path
          pathLength={1}
          style={drawStyle(PIECE_MS + 260)}
          className={draw}
          d="M156.0 310.0C170 315.5 230 315.5 244.0 310.0"
        />
        <path
          pathLength={1}
          style={drawStyle(PIECE_MS + 320)}
          className={draw}
          d="M162 92C162 86.6 179 82.4 200 82.4C221 82.4 238 86.6 238 92C238 97.4 221 101.6 200 101.6C179 101.6 162 97.4 162 92Z"
        />
      </g>

      {/* The rings the fingers left as the wall rose. */}
      <g strokeWidth={0.8} className="text-smoke">
        {RINGS.map((d, index) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            style={drawStyle(RINGS_MS + index * 60)}
            className={draw}
          />
        ))}
      </g>

      {/* The glaze band on the shoulder, and the one drip it left. */}
      <g className="text-sage">
        <path
          pathLength={1}
          strokeWidth={1.6}
          style={drawStyle(GLAZE_MS)}
          className={draw}
          d="M120.0 150.0C120.0 164.3 278.7 164.3 278.7 150.0"
        />
        <path
          pathLength={1}
          strokeWidth={1.3}
          style={drawStyle(GLAZE_MS + 160)}
          className={draw}
          d="M240 157C241 163 240 168 239 171"
        />
      </g>

      {/* The thumb dent: where the maker held it, and why it is not symmetrical. */}
      <path
        pathLength={1}
        strokeWidth={0.8}
        style={drawStyle(GLAZE_MS + 240)}
        className={draw}
        d="M272 141C282 148 285 158 281 169"
      />

      {/* The floor it stands on, and the shadow it casts. */}
      <ellipse
        cx={200}
        cy={314}
        rx={62}
        ry={6}
        fill="currentColor"
        fillOpacity={0.07}
        stroke="none"
        className={fade}
        style={fadeStyle(GROUND_MS)}
      />
      <path
        pathLength={1}
        strokeWidth={0.75}
        style={drawStyle(GROUND_MS)}
        className={draw}
        d="M108 320C160 317 244 323 296 319"
      />

      {/* The kiln mark at the foot: three flames, no taller than the foot. */}
      <g className="text-sage" strokeWidth={0.9}>
        <path
          pathLength={1}
          style={drawStyle(GROUND_MS + 120)}
          className={draw}
          d="M270 318C266 313 270 308 272 305M279 318C275 311 280 307 281 302M288 318C285 313 288 309 289 306"
        />
      </g>

      {/* The studio's line, carved under the piece. */}
      <path
        id="hero-verse-arc"
        stroke="none"
        d="M138 344C174 355 226 355 262 344"
      />
      <text
        className={cn("fill-sage font-script italic", fade)}
        style={fadeStyle(LABEL_MS)}
        fontSize={12}
      >
        <textPath href="#hero-verse-arc" startOffset="50%" textAnchor="middle">
          where clay meets verses
        </textPath>
      </text>

      {/* Kiln labels: the line draws, the dot lands, the claim fades in. */}
      <g>
        {LABELS.map((label, index) => (
          <g key={label.text}>
            <path
              d={`M${label.x} ${label.y}L${label.anchorX} ${label.anchorY}`}
              pathLength={1}
              strokeWidth={0.75}
              style={drawStyle(LINE_MS + index * LINE_STAGGER_MS)}
              className={draw}
            />
            <circle
              cx={label.anchorX}
              cy={label.anchorY}
              r={2.6}
              fill="currentColor"
              stroke="none"
              className={fade}
              style={fadeStyle(LINE_MS + index * LINE_STAGGER_MS + DRAW_MS)}
            />
            <text
              x={label.x + (label.align === "end" ? -8 : 8)}
              y={label.y - 6}
              textAnchor={label.align}
              fontSize={11.5}
              letterSpacing={1.5}
              stroke="none"
              className={cn("fill-ink font-sans uppercase", fade)}
              style={fadeStyle(LABEL_MS + index * LINE_STAGGER_MS)}
            >
              {label.text}
            </text>
            <text
              x={label.x + (label.align === "end" ? -8 : 8)}
              y={label.y + 12}
              textAnchor={label.align}
              fontSize={12.5}
              stroke="none"
              className={cn("fill-smoke font-script italic", fade)}
              style={fadeStyle(LABEL_MS + index * LINE_STAGGER_MS + 80)}
            >
              {label.note}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
