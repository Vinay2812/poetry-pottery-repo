/**
 * The piece drawn beside a category name. Same engine and same finish as the
 * product placeholders, redrawn for a 64px tile: fewer hatch rows, wider gaps
 * between strokes. Two shapes the placeholders have no use for live here — a
 * ring dish for the odds and ends, and a wood-fired bottle whose one mark is a
 * kiln blush rather than a glaze band.
 */

import type { PotteryIconKind } from "@/components/icons/pottery";
import {
  FILL_SCALE,
  PIECE_CENTRE_Y,
  drawVessel,
  toDrawnVessel,
  type DrawnVessel,
  type VesselSpec,
} from "@/components/media/vessels";
import {
  RING_SQUASH,
  halfWidthReader,
  hatchArcs,
  parsePath,
  type HatchStroke,
} from "@/lib/drawing/vessel";

const AXIS = 100;

export type CategoryPieceKind = PotteryIconKind | "accessories" | "wood-fired";

/** A kiln blush on one side: a warm haze and the hatching that flashed with it. */
interface FlashMark {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  strokes: HatchStroke[];
}

/** One clay shape with everything painted on it. Elements draw back to front. */
export interface PieceElement {
  body: string;
  handle: string | null;
  /** The mouth, or a solid top where the piece has no opening. */
  mouth: { outer: string; inner: string | null };
  rings: HatchStroke[];
  hatch: HatchStroke[];
  glaze: { band: string; top: string } | null;
  flash: FlashMark | null;
  outline: string[];
}

export interface CategoryPieceDrawing {
  title: string;
  elements: PieceElement[];
  shadow: Array<{ rx: number; ry: number; opacity: number }>;
  shadowY: number;
  centreY: number;
  scale: number;
}

interface ElementOptions {
  hasGlaze?: boolean;
  hasSolidTop?: boolean;
  flashAt?: number;
}

// Rows and strokes are thinned out because a tile shows the drawing at a third
// of the size a product card does, where dense hatching silts up into a smudge.
function toElement(vessel: DrawnVessel, options: ElementOptions): PieceElement {
  const near = parsePath(vessel.nearWall);
  const halfWidthAt = halfWidthReader(near, AXIS);
  const rimHalf = AXIS - near.start[0];
  const rimY = near.start[1];
  const footY = near.segments[near.segments.length - 1].end[1];
  const from = rimY + rimHalf * RING_SQUASH + 3;
  const to = footY - 4;
  const seed = Math.round(rimY * 31 + footY * 7 + rimHalf * 3);
  const hatch = hatchArcs({
    axisX: AXIS,
    from,
    to,
    step: Math.max(8, (to - from) / 7),
    radiusAt: halfWidthAt,
    softEdge: 9,
    seed,
    inset: 1.8,
    angleStep: 0.44,
  });

  return {
    body: vessel.body,
    handle: vessel.handle ?? null,
    mouth: {
      outer: vessel.mouth,
      inner: options.hasSolidTop ? null : vessel.mouthInner,
    },
    rings: vessel.rings,
    hatch,
    glaze:
      options.hasGlaze === false
        ? null
        : { band: vessel.glazeBand, top: vessel.glazeTop },
    flash:
      options.flashAt === undefined
        ? null
        : toFlash(options.flashAt, halfWidthAt, from, to, seed),
    outline: [vessel.nearWall, vessel.farWall, vessel.foot, vessel.mouth],
  };
}

// Flame flashing sits where the flame licked the piece, so it is read off the
// same rings as the shading and kept to the one side.
function toFlash(
  centreY: number,
  halfWidthAt: (y: number) => number,
  from: number,
  to: number,
  seed: number,
): FlashMark {
  const radius = halfWidthAt(centreY);
  const strokes = hatchArcs({
    axisX: AXIS,
    from,
    to,
    step: Math.max(7, (to - from) / 9),
    radiusAt: halfWidthAt,
    softEdge: 14,
    seed: seed + 57,
    inset: 2.6,
    angleStep: 0.26,
  }).filter((stroke) => stroke.band >= 2);

  return {
    cx: AXIS + radius * 0.62,
    cy: centreY,
    rx: radius * 1.15,
    ry: (to - from) * 0.62,
    strokes,
  };
}

const RING_DISH: VesselSpec = {
  profile: [
    [112, 48],
    [118, 47],
    [128, 40],
    [138, 30],
    [144, 25],
  ],
  glaze: [116, 124],
  rings: [124],
  title: "Drawing of a small ring dish",
  seed: 2881,
};

// The nub the rings hang on, standing in the middle of the dish.
const RING_POST: VesselSpec = {
  profile: [
    [90, 3.5],
    [94, 5],
    [103, 8],
    [113, 11],
  ],
  glaze: [104, 111],
  rings: [106],
  title: "Drawing of a ring post",
  seed: 3221,
};

const WOOD_FIRED_BOTTLE: VesselSpec = {
  profile: [
    [40, 13],
    [54, 12],
    [68, 17],
    [90, 37],
    [110, 44],
    [132, 41],
    [152, 29],
    [158, 26],
  ],
  glaze: [96, 112],
  rings: [114, 138],
  title: "Drawing of a wood-fired bottle",
  seed: 6611,
};

function fromVessel(kind: PotteryIconKind): CategoryPieceDrawing {
  const vessel = toDrawnVessel(kind);
  return {
    title: vessel.title,
    elements: [toElement(vessel, {})],
    shadow: vessel.shadow,
    shadowY: vessel.shadowY,
    centreY: PIECE_CENTRE_Y,
    scale: FILL_SCALE,
  };
}

function ringDish(): CategoryPieceDrawing {
  const dish = drawVessel(RING_DISH);
  const post = drawVessel(RING_POST);
  return {
    title: "Drawing of a small ring dish",
    elements: [
      toElement(dish, {}),
      toElement(post, { hasGlaze: false, hasSolidTop: true }),
    ],
    shadow: dish.shadow,
    shadowY: dish.shadowY,
    centreY: 134,
    scale: 1.9,
  };
}

function woodFiredBottle(): CategoryPieceDrawing {
  const bottle = drawVessel(WOOD_FIRED_BOTTLE);
  return {
    title: "Drawing of a wood-fired bottle",
    elements: [toElement(bottle, { hasGlaze: false, flashAt: 108 })],
    shadow: bottle.shadow,
    shadowY: bottle.shadowY,
    centreY: PIECE_CENTRE_Y,
    scale: 1.32,
  };
}

const KINDS: CategoryPieceKind[] = [
  "mug",
  "bowl",
  "plate",
  "vase",
  "planter",
  "serving-dish",
  "small-things",
  "accessories",
  "wood-fired",
];

const DRAWINGS = Object.fromEntries(
  KINDS.map((kind) => {
    if (kind === "accessories") return [kind, ringDish()];
    if (kind === "wood-fired") return [kind, woodFiredBottle()];
    return [kind, fromVessel(kind)];
  }),
) as Record<CategoryPieceKind, CategoryPieceDrawing>;

export function toCategoryPiece(kind: CategoryPieceKind): CategoryPieceDrawing {
  return DRAWINGS[kind];
}

// First match wins, so a slug naming two shapes is drawn as the one it leads with.
const KIND_BY_KEYWORD: [string, CategoryPieceKind][] = [
  ["wood", "wood-fired"],
  ["flashed", "wood-fired"],
  ["mug", "mug"],
  ["cup", "mug"],
  ["tumbler", "mug"],
  ["bowl", "bowl"],
  ["plate", "plate"],
  ["vase", "vase"],
  ["planter", "planter"],
  ["serve", "serving-dish"],
  ["serving", "serving-dish"],
  ["platter", "serving-dish"],
  ["dish", "serving-dish"],
  ["accessor", "accessories"],
  ["coaster", "accessories"],
  ["trinket", "accessories"],
];

/** A category slug picks the piece drawn beside its name. */
export function toCategoryPieceKind(slug: string): CategoryPieceKind {
  const text = slug.toLowerCase();
  for (const [keyword, kind] of KIND_BY_KEYWORD) {
    if (text.includes(keyword)) return kind;
  }
  return "small-things";
}
