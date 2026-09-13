/**
 * Surface of the moon jar: the closed silhouette, the cross-contour hatching,
 * the glaze wash and the label anchors, all derived from the outline in
 * `jar.ts` so the shading always sits on the form that is actually drawn.
 */

import {
  JAR_FOOT,
  JAR_LEFT_WALL,
  JAR_RIGHT_WALL,
} from "@/features/home/components/jar";

export type Point = [number, number];

export interface HatchStroke {
  d: string;
  opacity: number;
  /** Reveal band, 0 (left) to 3 (right), for the staggered fade-in. */
  band: number;
}

interface Segment {
  c1: Point;
  c2: Point;
  end: Point;
}

interface Spline {
  start: Point;
  segments: Segment[];
}

export const AXIS_X = 200;
export const GROUND_Y = 320;

// Foreshortening of a horizontal circle on the body, seen slightly from above.
const RING_SQUASH = 0.17;

const n = (value: number) => Number(value.toFixed(1));
const pair = (p: Point) => `${n(p[0])} ${n(p[1])}`;
const segmentsD = (segments: Segment[]) =>
  segments.map((s) => `C${pair(s.c1)} ${pair(s.c2)} ${pair(s.end)}`).join("");

// A seeded generator keeps the hand wobble identical on the server and the client.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5;
  };
}

function parse(d: string): Spline {
  const numbers = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const segments: Segment[] = [];
  for (let i = 2; i + 5 < numbers.length; i += 6) {
    segments.push({
      c1: [numbers[i], numbers[i + 1]],
      c2: [numbers[i + 2], numbers[i + 3]],
      end: [numbers[i + 4], numbers[i + 5]],
    });
  }
  return { start: [numbers[0], numbers[1]], segments };
}

function reverse({ start, segments }: Spline): Spline {
  const points = [start, ...segments.map((s) => s.end)];
  return {
    start: points[points.length - 1],
    segments: segments
      .map((s, index) => ({ c1: s.c2, c2: s.c1, end: points[index] }))
      .reverse(),
  };
}

function catmullRom(points: Point[]): Segment[] {
  const ends = points.length - 1;
  const before: Point = [
    2 * points[0][0] - points[1][0],
    2 * points[0][1] - points[1][1],
  ];
  const after: Point = [
    2 * points[ends][0] - points[ends - 1][0],
    2 * points[ends][1] - points[ends - 1][1],
  ];
  const all = [before, ...points, after];
  const segments: Segment[] = [];
  for (let i = 1; i < all.length - 2; i += 1) {
    const [p0, p1, p2, p3] = [all[i - 1], all[i], all[i + 1], all[i + 2]];
    segments.push({
      c1: [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
      c2: [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
      end: p2,
    });
  }
  return segments;
}

const LEFT = parse(JAR_LEFT_WALL);
const RIGHT_REVERSED = reverse(parse(JAR_RIGHT_WALL));
const FOOT_CURVE = JAR_FOOT.slice(JAR_FOOT.indexOf("C"));

/** Closed silhouette: fills the body and clips everything painted on it. */
export const BODY_PATH = `${JAR_LEFT_WALL}${FOOT_CURVE}${segmentsD(RIGHT_REVERSED.segments)}Z`;

// Sampled once so half widths can be read off the drawn wall.
const SAMPLES: Point[] = (() => {
  const out: Point[] = [];
  const points = [LEFT.start, ...LEFT.segments.map((s) => s.end)];
  LEFT.segments.forEach((s, index) => {
    const from = points[index];
    for (let step = 0; step <= 20; step += 1) {
      const t = step / 20;
      const u = 1 - t;
      out.push([
        u ** 3 * from[0] +
          3 * u * u * t * s.c1[0] +
          3 * u * t * t * s.c2[0] +
          t ** 3 * s.end[0],
        u ** 3 * from[1] +
          3 * u * u * t * s.c1[1] +
          3 * u * t * t * s.c2[1] +
          t ** 3 * s.end[1],
      ]);
    }
  });
  return out;
})();

/** Half width of the body at a height, taken from the outline itself. */
export function halfWidthAt(y: number): number {
  const nearest = SAMPLES.reduce((best, s) =>
    Math.abs(s[1] - y) < Math.abs(best[1] - y) ? s : best,
  );
  return AXIS_X - nearest[0];
}

const onRing = (y: number, radius: number, angle: number): Point => [
  AXIS_X + radius * Math.cos(angle),
  y + radius * RING_SQUASH * Math.sin(angle),
];

/**
 * An arc of the horizontal circle at height `y`. Angle 0 is the right edge,
 * PI the left edge, and the arc runs across the front of the piece.
 */
export function ringArc(
  y: number,
  from: number,
  to: number,
  inset = 0,
): string {
  const radius = Math.max(halfWidthAt(y) - inset, 1);
  const ry = radius * RING_SQUASH;
  const alpha = (4 / 3) * Math.tan((to - from) / 4);
  const start = onRing(y, radius, from);
  const end = onRing(y, radius, to);
  const c1: Point = [
    start[0] - alpha * radius * Math.sin(from),
    start[1] + alpha * ry * Math.cos(from),
  ];
  const c2: Point = [
    end[0] + alpha * radius * Math.sin(to),
    end[1] - alpha * ry * Math.cos(to),
  ];
  return `M${pair(start)}C${pair(c1)} ${pair(c2)} ${pair(end)}`;
}

const bandOf = (x: number) =>
  Math.min(3, Math.max(0, Math.floor(((x - 104) / 192) * 4)));

/**
 * Cross-contour hatching: short arcs of the body's own rings, dense on the
 * shaded right, thinning to nothing towards the lit left third.
 */
export function hatchStrokes(): HatchStroke[] {
  const random = seededRandom(515);
  const strokes: HatchStroke[] = [];
  let row = 0;
  for (let y = 110; y <= 302; y += 5.6) {
    row += 1;
    const radius = halfWidthAt(y);
    const fade = y < 126 ? (y - 104) / 24 : y > 286 ? (304 - y) / 20 : 1;
    if (fade <= 0) continue;
    // Rows are offset like brickwork so the hatching never reads as a grid.
    for (let angle = 0.07 + (row % 2) * 0.15; angle < 1.5; angle += 0.3) {
      // Light from the upper left: arcs are long and dark at the right edge,
      // short and pale as they turn into the lit third.
      const shade = (0.6 - 0.4 * angle) * fade;
      if (shade < 0.075) continue;
      const span = Math.max(0.03, 0.17 - 0.085 * angle) + random() * 0.015;
      const centre = angle + random() * 0.03;
      strokes.push({
        d: ringArc(y, centre - span, centre + span, 1.6),
        opacity: Number(Math.min(0.5, shade).toFixed(2)),
        band: bandOf(AXIS_X + radius * Math.cos(centre)),
      });
    }
  }
  return strokes;
}

/** The throwing rings, part of the shading rather than four flat lines. */
export function throwingRings(): HatchStroke[] {
  // Each ring is darker where the wall turns away and fades into the light.
  return [140, 178, 216, 252].flatMap((y) => [
    { d: ringArc(y, 0.18, 1.25, 1.5), opacity: 0.24, band: 0 },
    { d: ringArc(y, 1.25, 2.5, 1.5), opacity: 0.11, band: 0 },
  ]);
}

const GLAZE_TOP_Y = 144;
const GLAZE_BOTTOM_Y = 168;

/** Top edge of the glaze band, also used for its pale highlight line. */
export const GLAZE_TOP_PATH = ringArc(GLAZE_TOP_Y, 0.02, Math.PI - 0.02, -3);

/** The band itself: a wash whose lower edge crawled unevenly as it dried. */
export const GLAZE_BAND_PATH = (() => {
  const random = seededRandom(9981);
  const radius = halfWidthAt(GLAZE_BOTTOM_Y) + 3;
  const points: Point[] = [];
  for (let step = 0; step <= 8; step += 1) {
    const angle = Math.PI - 0.02 - (step / 8) * (Math.PI - 0.04);
    const [x, y] = onRing(GLAZE_BOTTOM_Y, radius, angle);
    // The lower edge crawled as the wash dried, so it never sits level.
    points.push([x, y + 1.5 + random() * 4.5]);
  }
  const right = onRing(GLAZE_TOP_Y, halfWidthAt(GLAZE_TOP_Y) + 3, 0.02);
  return `${GLAZE_TOP_PATH}L${pair(points[0])}${segmentsD(catmullRom(points))}L${pair(right)}Z`;
})();

/** One drip that ran off the band and pooled at its end. */
export const GLAZE_DRIP_PATH = (() => {
  const [x, y] = onRing(GLAZE_BOTTOM_Y, halfWidthAt(GLAZE_BOTTOM_Y), 0.72);
  return `M${n(x - 2.2)} ${n(y)}C${n(x - 2.4)} ${n(y + 12)} ${n(x - 3.2)} ${n(y + 18)} ${n(x - 0.4)} ${n(y + 21)}C${n(x + 2.6)} ${n(y + 18)} ${n(x + 2)} ${n(y + 11)} ${n(x + 2.2)} ${n(y)}Z`;
})();

/** Where the leader lines land: each dot sits exactly on one of these points. */
export const ANCHORS: Record<"glaze" | "dent" | "wall" | "ground", Point> = {
  glaze: onRing(GLAZE_TOP_Y + 8, halfWidthAt(GLAZE_TOP_Y + 8), 0.34),
  dent: onRing(206, halfWidthAt(206), 0.12),
  wall: [AXIS_X - halfWidthAt(138), 138],
  ground: [170, GROUND_Y + 0.6],
};

/** The thumb press that stopped the jar from being symmetrical. */
export const DENT_PATH = (() => {
  const [x, y] = ANCHORS.dent;
  return `M${n(x - 9)} ${n(y - 13)}C${n(x - 1)} ${n(y - 8)} ${n(x + 1)} ${n(y + 2)} ${n(x - 3)} ${n(y + 13)}`;
})();
