import type { AdminGlazeInput } from "@/graphql/generated/graphql";

import { pluralize } from "@/lib/format";

import type { AdminGlazeFormValues } from "@/lib/validations/admin/glaze";

export const GLAZES_PAGE_SIZE = 20;

export interface GlazeRow {
  id: number;
  slug: string;
  name: string;
  description: string;
  variationNote: string;
  swatchUrl: string | null;
  colorCode: string | null;
  productCount: number;
}

export const EMPTY_GLAZE_FORM: AdminGlazeFormValues = {
  name: "",
  description: "",
  variation_note: "",
  color_code: "",
};

export function toGlazeRow(row: {
  glaze: {
    id: number;
    slug: string;
    name: string;
    description: string;
    variation_note: string | null;
    swatch_url: string | null;
    color_code: string | null;
  };
  product_count: number;
}): GlazeRow {
  return {
    id: row.glaze.id,
    slug: row.glaze.slug,
    name: row.glaze.name,
    description: row.glaze.description,
    variationNote: row.glaze.variation_note ?? "",
    swatchUrl: row.glaze.swatch_url,
    colorCode: row.glaze.color_code,
    productCount: row.product_count,
  };
}

export function toGlazeFormValues(row: GlazeRow): AdminGlazeFormValues {
  return {
    name: row.name,
    description: row.description,
    variation_note: row.variationNote,
    color_code: row.colorCode ?? "",
  };
}

export function toGlazeInput(
  values: AdminGlazeFormValues,
  swatchUrl: string | null,
): AdminGlazeInput {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    variation_note:
      values.variation_note.trim() === "" ? null : values.variation_note.trim(),
    color_code: values.color_code.trim() === "" ? null : values.color_code,
    swatch_url: swatchUrl,
  };
}

export function describePieces(count: number): string {
  return count === 0 ? "None yet" : pluralize(count, "piece");
}

/** The API refuses the delete too; saying so first saves the round trip. */
export function describeGlazeDeletion(name: string, count: number): string {
  if (count === 0) {
    return `${name} is on no pieces. Deleting it cannot be undone.`;
  }
  return `${pluralize(count, "piece")} still wear ${name}. Move them to another glaze first.`;
}

export function canDeleteGlaze(count: number): boolean {
  return count === 0;
}

export type GlazePatch =
  { kind: "save"; row: GlazeRow } | { kind: "remove"; id: number };

export function applyGlazePatch(
  rows: GlazeRow[],
  patch: GlazePatch,
): GlazeRow[] {
  if (patch.kind === "remove") {
    return rows.filter((row) => row.id !== patch.id);
  }
  // A draft (id 0) whose saved row has already been read back is matched by name, so it never shows twice.
  const isSame = (row: GlazeRow) =>
    row.id === patch.row.id ||
    (patch.row.id === 0 && row.name === patch.row.name);
  if (!rows.some(isSame)) return [patch.row, ...rows];
  return rows.map((row) => (isSame(row) ? { ...patch.row, id: row.id } : row));
}
