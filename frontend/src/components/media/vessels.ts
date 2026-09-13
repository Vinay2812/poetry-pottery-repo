/**
 * The seven pieces drawn where a photo is missing. Each one is a profile put
 * through the same engine as the hero jar, so a placeholder mug is shaded like
 * the piece on the home page rather than reduced to an outline.
 */

import type { PotteryIconKind } from "@/components/icons/pottery";
import {
  RING_SQUASH,
  closedBody,
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

interface VesselSpec {
  /** Rim first, foot last, as [height, half width]. */
  profile: Array<[number, number]>;
  glaze: [number, number];
  rings: number[];
  handle?: string;
  title: string;
  seed: number;
}

export interface DrawnVessel {
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

/** An ellipse as two cubics, for a rim seen slightly from above. */
function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  const k = (ry * 4) / 3;
  const left: Point = [cx - rx, cy];
  const right: Point = [cx + rx, cy];
  return (
    `M${pointD(left)}C${pointD([cx - rx, cy - k])} ${pointD([cx + rx, cy - k])} ${pointD(right)}` +
    `C${pointD([cx + rx, cy + k])} ${pointD([cx - rx, cy + k])} ${pointD(left)}Z`
  );
}

function build(spec: VesselSpec): DrawnVessel {
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

  return {
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
  Object.entries(SPECS).map(([kind, spec]) => [kind, build(spec)]),
) as Record<PotteryIconKind, DrawnVessel>;

export function toDrawnVessel(kind: PotteryIconKind): DrawnVessel {
  return VESSELS[kind];
}
