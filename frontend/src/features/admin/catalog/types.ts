import { formatDate } from "@/lib/format";

import type {
  AdminCategoryFormValues,
  AdminCollectionFormValues,
} from "@/lib/validations/admin/catalog";

export interface CategoryRow {
  id: number;
  name: string;
  icon: string;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
}

export interface CollectionRow {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  productCount: number;
}

export type CatalogEditorKind = "category" | "collection";

export const EMPTY_CATEGORY_FORM: AdminCategoryFormValues = {
  name: "",
  icon: "",
  sort_order: "0",
};

export const EMPTY_COLLECTION_FORM: AdminCollectionFormValues = {
  name: "",
  description: "",
  starts_at: "",
  ends_at: "",
};

export function describePieces(count: number): string {
  if (count === 0) return "No pieces";
  return count === 1 ? "1 piece" : `${count} pieces`;
}

/** Both ends open means the collection simply stays on the shelf. */
export function describeWindow(
  startsAt: string | null,
  endsAt: string | null,
): string {
  if (startsAt !== null && endsAt !== null) {
    return `${formatDate(startsAt)} → ${formatDate(endsAt)}`;
  }
  if (startsAt !== null) return `From ${formatDate(startsAt)}`;
  if (endsAt !== null) return `Until ${formatDate(endsAt)}`;
  return "Always on";
}

/** An input[type=datetime-local] speaks local wall time; the API speaks ISO. */
export function toDateTimeLocal(iso: string | null): string {
  if (iso === null || iso === "") return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join("T");
}

export function fromDateTimeLocal(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export type CategoryPatch =
  | {
      kind: "save";
      id: number;
      name: string;
      icon: string;
      imageUrl: string | null;
    }
  | { kind: "remove"; id: number };

export function applyCategoryPatch(
  rows: CategoryRow[],
  patch: CategoryPatch,
): CategoryRow[] {
  if (patch.kind === "remove") {
    return rows.filter((row) => row.id !== patch.id);
  }
  return rows.map((row) =>
    row.id === patch.id
      ? { ...row, name: patch.name, icon: patch.icon, imageUrl: patch.imageUrl }
      : row,
  );
}

export type CollectionPatch =
  | {
      kind: "save";
      id: number;
      name: string;
      description: string;
      imageUrl: string | null;
      startsAt: string | null;
      endsAt: string | null;
    }
  | { kind: "remove"; id: number };

export function applyCollectionPatch(
  rows: CollectionRow[],
  patch: CollectionPatch,
): CollectionRow[] {
  if (patch.kind === "remove") {
    return rows.filter((row) => row.id !== patch.id);
  }
  return rows.map((row) =>
    row.id === patch.id
      ? {
          ...row,
          name: patch.name,
          description: patch.description,
          imageUrl: patch.imageUrl,
          startsAt: patch.startsAt,
          endsAt: patch.endsAt,
        }
      : row,
  );
}

export function describeCategoryDeletion(
  name: string,
  productCount: number,
): string {
  if (productCount === 0) {
    return `${name} holds nothing. Deleting it cannot be undone.`;
  }
  return `${name} still holds ${describePieces(productCount).toLowerCase()}. They stay on the shelf but lose this category.`;
}

export function describeCollectionDeletion(
  name: string,
  productCount: number,
): string {
  if (productCount === 0) {
    return `${name} holds nothing. Deleting it cannot be undone.`;
  }
  return `${name} still groups ${describePieces(productCount).toLowerCase()}. They stay on the shelf but lose this collection.`;
}
