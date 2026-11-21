import type { PotteryIconKind } from "@/components/icons/pottery";

export type CategoryPieceKind = PotteryIconKind | "accessories" | "wood-fired";

// A Record, so a new kind cannot compile until the admin picker can offer it.
const LABELS: Record<CategoryPieceKind, string> = {
  mug: "Mug",
  bowl: "Bowl",
  plate: "Plate",
  vase: "Vase",
  planter: "Planter",
  "serving-dish": "Serving dish",
  accessories: "Ring dish",
  "wood-fired": "Wood-fired bottle",
  "small-things": "Small things",
};

export function isCategoryPieceKind(value: string): value is CategoryPieceKind {
  return Object.hasOwn(LABELS, value);
}

/** The drawings an admin can pick for a category, in the order the picker lists them. */
export const CATEGORY_PIECE_OPTIONS: {
  kind: CategoryPieceKind;
  label: string;
}[] = Object.entries(LABELS).flatMap(([kind, label]) =>
  isCategoryPieceKind(kind) ? [{ kind, label }] : [],
);

export const CATEGORY_PIECE_KINDS: CategoryPieceKind[] =
  CATEGORY_PIECE_OPTIONS.map((option) => option.kind);
