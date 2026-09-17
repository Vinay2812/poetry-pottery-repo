/**
 * The seven pieces drawn where a photo is missing. Each one is a profile put
 * through the same engine as the hero jar, so a placeholder mug is shaded like
 * the piece on the home page rather than reduced to an outline.
 */

import type { PotteryIconKind } from "@/components/icons/pottery";
import {
  RING_SQUASH,
  closedBody,
  ellipsePath,
  halfWidthReader,
  hatchArcs,
  pointD,
  ringArc,
  splineD,
  wallSpline,
  washBand,
  type HatchStroke,
  type Point,
} from "@/lib/drawing/vessel";

export const VESSEL_BOX = 200;
const AXIS = 100;
// The drawn piece sits in the middle half of its box, so left alone it reads far smaller
// than a photographed piece does in its frame. These lift it to the same optical size.
export const PIECE_CENTRE_Y = 108;
export const FILL_SCALE = 1.4;

export interface VesselSpec {
  /** Rim first, foot last, as [height, half width]. */
  profile: Array<[number, number]>;
  glaze: [number, number];
  rings: number[];
  handle?: string;
  title: string;
  seed: number;
}

/** Where the kiln label's dots land, as a percentage of the rendered square. */
interface VesselAnchors {
  glaze: { x: number; y: number };
  clay: { x: number; y: number };
  size: { x: number; y: number };
}

export interface DrawnVessel {
  anchors: VesselAnchors;
  body: string;
  nearWall: string;
  farWall: string;
  foot: string;
  mouth: string;
  mouthInner: string;
  glazeBand: string;
  glazeTop: string;
  rings: HatchStroke[];
  hatch: HatchStroke[];
  handle?: string;
  shadow: Array<{ rx: number; ry: number; opacity: number }>;
  shadowY: number;
  title: string;
}

const SPECS: Record<PotteryIconKind, VesselSpec> = {
  mug: {
    profile: [
      [58, 33],
      [68, 33.5],
      [100, 32],
      [134, 29.5],
      [152, 28],
    ],
    glaze: [70, 82],
    rings: [96, 124],
    handle:
      "M131 80C150 79 163 88 163 102C163 116 150 126 130 127C142 122 150 113 150 102C150 92 143 84 131 80Z",
    title: "Drawing of a hand-thrown mug",
    seed: 4111,
  },
  bowl: {
    profile: [
      [70, 56],
      [84, 55],
      [102, 49],
      [120, 40],
      [136, 30],
      [147, 23],
      [152, 22],
    ],
    glaze: [78, 88],
    rings: [104, 124],
    title: "Drawing of a hand-thrown bowl",
    seed: 5221,
  },
  plate: {
    profile: [
      [84, 68],
      [96, 62],
      [120, 34],
      [140, 22],
      [148, 20],
    ],
    glaze: [92, 101],
    rings: [112],
    title: "Drawing of a hand-thrown plate",
    seed: 6331,
  },
  vase: {
    profile: [
      [46, 18],
      [58, 16],
      [76, 32],
      [100, 44],
      [124, 42],
      [144, 30],
      [156, 24],
    ],
    glaze: [84, 96],
    rings: [110, 132],
    title: "Drawing of a hand-thrown vase",
    seed: 7441,
  },
  planter: {
    profile: [
      [66, 50],
      [78, 48],
      [116, 38],
      [144, 30],
      [152, 29],
    ],
    glaze: [74, 84],
    rings: [104, 130],
    title: "Drawing of a hand-thrown planter",
    seed: 8551,
  },
  "serving-dish": {
    profile: [
      [74, 64],
      [88, 62],
      [106, 54],
      [124, 42],
      [140, 30],
      [150, 26],
    ],
    glaze: [82, 92],
    rings: [106, 126],
    title: "Drawing of a hand-thrown serving dish",
    seed: 9661,
  },
  "small-things": {
    profile: [
      [74, 24],
      [86, 30],
      [112, 33],
      [140, 27],
      [150, 23],
    ],
    glaze: [82, 92],
    rings: [104, 126],
    title: "Drawing of a small hand-thrown piece",
    seed: 1771,
  },
};

// The drawing is scaled about its own centre before it is rendered, so an anchor
// has to be put through the same transform to land where the eye sees the piece.
function toBoxPercent(value: number, centre: number): number {
  return ((centre + FILL_SCALE * (value - centre)) / VESSEL_BOX) * 100;
}

/** Puts one profile through the engine: silhouette, rings, hatching, glaze. */
export function drawVessel(spec: VesselSpec): DrawnVessel {
  const [rimY, rimHalf] = spec.profile[0];
  const [footY, footHalf] = spec.profile[spec.profile.length - 1];
  const near = wallSpline(
    spec.profile.map<Point>(([y, half]) => [AXIS - half, y]),
    spec.seed,
    0.45,
  );
  // The far wall is a touch narrower, so the piece is never mirror-perfect.
  const far = wallSpline(
    spec.profile.map<Point>(([y, half]) => [AXIS + half * 0.99, y]),
    spec.seed + 7,
    0.45,
  );
  const footCurve = `C${pointD([AXIS - footHalf * 0.55, footY + 3.6])} ${pointD([AXIS + footHalf * 0.55, footY + 3.6])} ${pointD([AXIS + footHalf * 0.99, footY])}`;
  const halfWidthAt = halfWidthReader(near, AXIS);
  const rimRy = rimHalf * RING_SQUASH;
  const hatchFrom = rimY + rimRy + 3;
  const [glazeTopY, glazeBottomY] = spec.glaze;
  const glaze = washBand({
    axisX: AXIS,
    topY: glazeTopY,
    bottomY: glazeBottomY,
    radiusAt: halfWidthAt,
    overflow: 2,
    seed: spec.seed + 31,
  });

  // Every dot has to sit on the thing its label names: the glaze band, the bare wall
  // under it, and the rim where the width is read. Both wall dots stay left of the
  // axis, where a mug's handle never is.
  const clayY = glazeBottomY + (footY - glazeBottomY) * 0.55;
  const glazeY = (glazeTopY + glazeBottomY) / 2;

  return {
    anchors: {
      glaze: {
        x: toBoxPercent(AXIS - halfWidthAt(glazeY) * 0.45, AXIS),
        y: toBoxPercent(glazeY, PIECE_CENTRE_Y),
      },
      clay: {
        x: toBoxPercent(AXIS - halfWidthAt(clayY) * 0.5, AXIS),
        y: toBoxPercent(clayY, PIECE_CENTRE_Y),
      },
      size: {
        x: toBoxPercent(AXIS + rimHalf, AXIS),
        y: toBoxPercent(rimY, PIECE_CENTRE_Y),
      },
    },
    body: closedBody(near, far, footCurve),
    nearWall: splineD(near),
    farWall: splineD(far),
    foot: `M${pointD([AXIS - footHalf, footY])}${footCurve}`,
    mouth: ellipsePath(AXIS, rimY, rimHalf, rimRy),
    mouthInner: ellipsePath(
      AXIS,
      rimY + rimRy * 0.22,
      rimHalf * 0.86,
      rimRy * 0.86,
    ),
    glazeBand: glaze.band,
    glazeTop: glaze.top,
    rings: spec.rings.flatMap((y) => [
      {
        d: ringArc(AXIS, y, halfWidthAt(y) - 1.5, 0.18, 1.25),
        opacity: 0.24,
        band: 0,
      },
      {
        d: ringArc(AXIS, y, halfWidthAt(y) - 1.5, 1.25, 2.5),
        opacity: 0.11,
        band: 0,
      },
    ]),
    hatch: hatchArcs({
      axisX: AXIS,
      from: hatchFrom,
      to: footY - 4,
      step: Math.max(4.2, (footY - 4 - hatchFrom) / 15),
      radiusAt: halfWidthAt,
      softEdge: 12,
      seed: spec.seed + 13,
      inset: 1.4,
    }),
    handle: spec.handle,
    shadow: [
      { rx: footHalf * 2.6, ry: footHalf * 0.32, opacity: 0.05 },
      { rx: footHalf * 1.8, ry: footHalf * 0.24, opacity: 0.05 },
      { rx: footHalf * 1.1, ry: footHalf * 0.18, opacity: 0.06 },
    ],
    shadowY: footY + 4,
    title: spec.title,
  };
}

const VESSELS = Object.fromEntries(
  Object.entries(SPECS).map(([kind, spec]) => [kind, drawVessel(spec)]),
) as Record<PotteryIconKind, DrawnVessel>;

export function toDrawnVessel(kind: PotteryIconKind): DrawnVessel {
  return VESSELS[kind];
}

/** The cup a piece is measured against: an ordinary 250 ml tea cup. */
export const REFERENCE_CUP = {
  kind: "mug" as PotteryIconKind,
  heightCm: 9,
  diameterCm: 8,
  capacityMl: 250,
};

export interface Silhouette {
  /** Closed outline, foot on y = 0, axis on x = 0, rim at y = -height. */
  body: string;
  /** The mouth seen slightly from above, so the piece is not a flat cut-out. */
  rim: string;
}

/**
 * The same profile as the drawn placeholder, redrawn to a height and a width the
 * caller chooses, so two pieces can stand side by side at the size they really are.
 */
export function toSilhouette(
  kind: PotteryIconKind,
  height: number,
  width: number,
): Silhouette {
  const spec = SPECS[kind];
  const rimBoxY = spec.profile[0][0];
  const footBoxY = spec.profile[spec.profile.length - 1][0];
  const widest = Math.max(...spec.profile.map(([, half]) => half));
  const points = spec.profile.map<Point>(([boxY, half]) => [
    (half / widest) * (width / 2),
    -((footBoxY - boxY) / (footBoxY - rimBoxY)) * height,
  ]);
  const near = wallSpline(
    points.map<Point>(([half, y]) => [-half, y]),
    spec.seed,
    0,
  );
  const far = wallSpline(
    points.map<Point>(([half, y]) => [half, y]),
    spec.seed,
    0,
  );
  const [footHalf] = points[points.length - 1];
  const footCurve = `C${pointD([-footHalf * 0.55, height * 0.03])} ${pointD([footHalf * 0.55, height * 0.03])} ${pointD([footHalf, 0])}`;
  const [rimHalf, rimY] = points[0];
  return {
    body: closedBody(near, far, footCurve),
    rim: ellipsePath(0, rimY, rimHalf, rimHalf * RING_SQUASH),
  };
}
