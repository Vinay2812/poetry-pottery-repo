/**
 * How a thrown vessel is drawn: a profile becomes a silhouette, the silhouette
 * gives half widths, and half widths give the rings, the cross-contour hatching
 * and the glaze wash. The hero jar and the product placeholders both use this,
 * so every drawn piece on the site is shaded the same way.
 */

export type Point = [number, number];

interface Segment {
  c1: Point;
  c2: Point;
  end: Point;
}

interface Spline {
  start: Point;
  segments: Segment[];
}

export interface HatchStroke {
  d: string;
  opacity: number;
  /** Reveal band, 0 (left) to 3 (right), for a staggered fade-in. */
  band: number;
}

/** Foreshortening of a horizontal circle on a piece, seen slightly from above. */
export const RING_SQUASH = 0.17;

const round = (value: number) => Number(value.toFixed(1));

export const pointD = (p: Point) => `${round(p[0])} ${round(p[1])}`;

const segmentsD = (segments: Segment[]) =>
  segments
    .map((s) => `C${pointD(s.c1)} ${pointD(s.c2)} ${pointD(s.end)}`)
    .join("");

export const splineD = ({ start, segments }: Spline) =>
  `M${pointD(start)}${segmentsD(segments)}`;

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

function catmullRom(points: Point[]): Segment[] {
  const last = points.length - 1;
  const before: Point = [
    2 * points[0][0] - points[1][0],
    2 * points[0][1] - points[1][1],
  ];
  const after: Point = [
    2 * points[last][0] - points[last - 1][0],
    2 * points[last][1] - points[last - 1][1],
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

/** A wall through the given points, with a whisper of wobble so it is not machined. */
export function wallSpline(
  points: Point[],
  seed: number,
  wobble = 0.7,
): Spline {
  const random = seededRandom(seed);
  return {
    start: points[0],
    segments: catmullRom(points).map((s) => ({
      c1: [s.c1[0] + random() * wobble, s.c1[1] + random() * wobble] as Point,
      c2: [s.c2[0] + random() * wobble, s.c2[1] + random() * wobble] as Point,
      end: s.end,
    })),
  };
}

function reverseSpline({ start, segments }: Spline): Spline {
  const points = [start, ...segments.map((s) => s.end)];
  return {
    start: points[points.length - 1],
    segments: segments
      .map((s, index) => ({ c1: s.c2, c2: s.c1, end: points[index] }))
      .reverse(),
  };
}

/** Reads back a path of one moveto and cubics, so drawn outlines can be measured. */
export function parsePath(d: string): Spline {
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

/** Closed silhouette: down the near wall, across the foot, back up the far wall. */
export function closedBody(
  left: Spline,
  right: Spline,
  footCurve: string,
): string {
  const back = reverseSpline(right);
  return `${splineD(left)}${footCurve}${segmentsD(back.segments)}Z`;
}

function sampleSpline(spline: Spline, steps = 20): Point[] {
  const points = [spline.start, ...spline.segments.map((s) => s.end)];
  const out: Point[] = [];
  spline.segments.forEach((s, index) => {
    const from = points[index];
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
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
}

/** Half width of a piece at a height, read off the wall that is actually drawn. */
export function halfWidthReader(
  wall: Spline,
  axisX: number,
): (y: number) => number {
  const samples = sampleSpline(wall);
  return (y: number) => {
    const nearest = samples.reduce((best, s) =>
      Math.abs(s[1] - y) < Math.abs(best[1] - y) ? s : best,
    );
    return Math.abs(axisX - nearest[0]);
  };
}

const onRing = (
  axisX: number,
  y: number,
  radius: number,
  angle: number,
): Point => [
  axisX + radius * Math.cos(angle),
  y + radius * RING_SQUASH * Math.sin(angle),
];

/**
 * An arc of the horizontal circle at height `y`. Angle 0 is the right edge,
 * PI the left edge, and the arc runs across the front of the piece.
 */
export function ringArc(
  axisX: number,
  y: number,
  radius: number,
  from: number,
  to: number,
): string {
  const safe = Math.max(radius, 1);
  const ry = safe * RING_SQUASH;
  const alpha = (4 / 3) * Math.tan((to - from) / 4);
  const start = onRing(axisX, y, safe, from);
  const end = onRing(axisX, y, safe, to);
  const c1: Point = [
    start[0] - alpha * safe * Math.sin(from),
    start[1] + alpha * ry * Math.cos(from),
  ];
  const c2: Point = [
    end[0] + alpha * safe * Math.sin(to),
    end[1] - alpha * ry * Math.cos(to),
  ];
  return `M${pointD(start)}C${pointD(c1)} ${pointD(c2)} ${pointD(end)}`;
}

export interface HatchOptions {
  axisX: number;
  from: number;
  to: number;
  step: number;
  radiusAt: (y: number) => number;
  /** Rows nearer than this to either end fade out. */
  softEdge?: number;
  seed?: number;
  inset?: number;
}

/**
 * Cross-contour hatching: short arcs of the piece's own rings, dense and long
 * on the shaded right, shortening to nothing as the wall turns into the light.
 */
export function hatchArcs({
  axisX,
  from,
  to,
  step,
  radiusAt,
  softEdge = 16,
  seed = 515,
  inset = 1.6,
}: HatchOptions): HatchStroke[] {
  const random = seededRandom(seed);
  const strokes: HatchStroke[] = [];
  let row = 0;
  for (let y = from; y <= to; y += step) {
    row += 1;
    const radius = radiusAt(y);
    const fade = Math.min(
      1,
      (y - from + 2) / softEdge,
      (to - y + 2) / softEdge,
    );
    if (fade <= 0 || radius < 4) continue;
    // Rows are offset like brickwork so the hatching never reads as a grid.
    for (let angle = 0.07 + (row % 2) * 0.15; angle < 1.5; angle += 0.3) {
      // Light from the upper left: the right edge is darkest, the left third bare.
      const shade = (0.6 - 0.4 * angle) * fade;
      if (shade < 0.075) continue;
      const span = Math.max(0.03, 0.17 - 0.085 * angle) + random() * 0.015;
      const centre = angle + random() * 0.03;
      strokes.push({
        d: ringArc(axisX, y, radius - inset, centre - span, centre + span),
        opacity: Number(Math.min(0.5, shade).toFixed(2)),
        // Band 0 is the strokes nearest the light, so a reveal runs left to right.
        band: Math.min(3, Math.max(0, 3 - Math.floor((centre / 1.5) * 4))),
      });
    }
  }
  return strokes;
}

export interface WashOptions {
  axisX: number;
  topY: number;
  bottomY: number;
  radiusAt: (y: number) => number;
  overflow?: number;
  seed?: number;
}

/** A glaze band: level along the top, crawled unevenly along the bottom. */
export function washBand({
  axisX,
  topY,
  bottomY,
  radiusAt,
  overflow = 3,
  seed = 9981,
}: WashOptions): { band: string; top: string } {
  const random = seededRandom(seed);
  const top = ringArc(
    axisX,
    topY,
    radiusAt(topY) + overflow,
    0.02,
    Math.PI - 0.02,
  );
  const radius = radiusAt(bottomY) + overflow;
  const points: Point[] = [];
  for (let step = 0; step <= 8; step += 1) {
    const angle = Math.PI - 0.02 - (step / 8) * (Math.PI - 0.04);
    const [x, y] = onRing(axisX, bottomY, radius, angle);
    points.push([x, y + 1.5 + random() * 4.5]);
  }
  const right = onRing(axisX, topY, radiusAt(topY) + overflow, 0.02);
  return {
    top,
    band: `${top}L${pointD(points[0])}${segmentsD(catmullRom(points))}L${pointD(right)}Z`,
  };
}

/** A point on the surface, for anchoring a label or hanging a drip. */
export function surfacePoint(
  axisX: number,
  y: number,
  radius: number,
  angle: number,
): Point {
  return onRing(axisX, y, radius, angle);
}
