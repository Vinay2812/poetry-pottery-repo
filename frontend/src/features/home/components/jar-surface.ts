/**
 * Surface of the hero moon jar: the closed silhouette, the cross-contour
 * hatching, the glaze wash and the label anchors, all derived from the outline
 * in `jar.ts` so the shading sits on the form that is actually drawn.
 */

import {
  JAR_FOOT,
  JAR_LEFT_WALL,
  JAR_RIGHT_WALL,
} from "@/features/home/components/jar";
import {
  closedBody,
  halfWidthReader,
  hatchArcs,
  parsePath,
  pointD,
  ringArc,
  surfacePoint,
  washBand,
  type HatchStroke,
  type Point,
} from "@/lib/drawing/vessel";

export type { HatchStroke, Point };

export const AXIS_X = 200;
export const GROUND_Y = 320;

const LEFT = parsePath(JAR_LEFT_WALL);
const RIGHT = parsePath(JAR_RIGHT_WALL);
const FOOT_CURVE = JAR_FOOT.slice(JAR_FOOT.indexOf("C"));

/** Closed silhouette: fills the body and clips everything painted on it. */
export const BODY_PATH = closedBody(LEFT, RIGHT, FOOT_CURVE);

/** Half width of the body at a height, taken from the outline itself. */
export const halfWidthAt = halfWidthReader(LEFT, AXIS_X);

/** An arc of the horizontal circle at height `y`, inset from the wall. */
function jarRing(y: number, from: number, to: number, inset = 0): string {
  return ringArc(AXIS_X, y, halfWidthAt(y) - inset, from, to);
}

/** Hatching that shades the right wall and leaves the lit third bare. */
export function hatchStrokes(): HatchStroke[] {
  return hatchArcs({
    axisX: AXIS_X,
    from: 110,
    to: 302,
    step: 5.6,
    radiusAt: halfWidthAt,
    softEdge: 20,
  });
}

/** The throwing rings, part of the shading rather than four flat lines. */
export function throwingRings(): HatchStroke[] {
  // Each ring is darker where the wall turns away and fades into the light.
  return [140, 178, 216, 252].flatMap((y) => [
    { d: jarRing(y, 0.18, 1.25, 1.5), opacity: 0.24, band: 0 },
    { d: jarRing(y, 1.25, 2.5, 1.5), opacity: 0.11, band: 0 },
  ]);
}

const GLAZE_TOP_Y = 144;
const GLAZE_BOTTOM_Y = 168;

const GLAZE = washBand({
  axisX: AXIS_X,
  topY: GLAZE_TOP_Y,
  bottomY: GLAZE_BOTTOM_Y,
  radiusAt: halfWidthAt,
});

/** Top edge of the glaze band, also used for its pale highlight line. */
export const GLAZE_TOP_PATH = GLAZE.top;

/** The band itself: a wash whose lower edge crawled unevenly as it dried. */
export const GLAZE_BAND_PATH = GLAZE.band;

/** One drip that ran off the band and pooled at its end. */
export const GLAZE_DRIP_PATH = (() => {
  const [x, y] = surfacePoint(
    AXIS_X,
    GLAZE_BOTTOM_Y,
    halfWidthAt(GLAZE_BOTTOM_Y),
    0.72,
  );
  const at = (dx: number, dy: number) => pointD([x + dx, y + dy]);
  return `M${at(-2.2, 0)}C${at(-2.4, 12)} ${at(-3.2, 18)} ${at(-0.4, 21)}C${at(2.6, 18)} ${at(2, 11)} ${at(2.2, 0)}Z`;
})();

/** Where the leader lines land: each dot sits exactly on one of these points. */
export const ANCHORS: Record<"glaze" | "dent" | "wall" | "ground", Point> = {
  glaze: surfacePoint(
    AXIS_X,
    GLAZE_TOP_Y + 8,
    halfWidthAt(GLAZE_TOP_Y + 8),
    0.34,
  ),
  dent: surfacePoint(AXIS_X, 206, halfWidthAt(206), 0.12),
  wall: [AXIS_X - halfWidthAt(138), 138],
  ground: [170, GROUND_Y + 0.6],
};

/** The thumb press that stopped the jar from being symmetrical. */
export const DENT_PATH = (() => {
  const [x, y] = ANCHORS.dent;
  const at = (dx: number, dy: number) => pointD([x + dx, y + dy]);
  return `M${at(-9, -13)}C${at(-1, -8)} ${at(1, 2)} ${at(-3, 13)}`;
})();
