import type { ArchivePieceFragment } from "@/graphql/generated/graphql";

export type ArchivePieceData = ArchivePieceFragment;

export const ARCHIVE_PATH = "/archive";

const MONTH_YEAR = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const YEAR = new Intl.DateTimeFormat("en-IN", {
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

// Pieces made outside a named run still belong on the wall; they get one shelf of their own.
export const LOOSE_COLLECTION = "Odd pieces";

export function toMadeLabel(createdAt: string): string {
  return `Made ${MONTH_YEAR.format(new Date(createdAt))}`;
}

export function toYear(createdAt: string): string {
  return YEAR.format(new Date(createdAt));
}

// Every tile repeats the same words, so the accessible name says which piece is meant.
export function toAskLabel(name: string): string {
  return `Ask for one like the ${name}`;
}

interface ArchiveShelf {
  collection: string;
  // Where this shelf starts on the wall, so the first tiles can be the eager ones.
  startIndex: number;
  pieces: ArchivePieceData[];
}

export interface ArchiveYear {
  year: string;
  count: number;
  shelves: ArchiveShelf[];
}

// A dated wall: newest year first, and inside a year the collections in the order they appear.
export function toArchiveYears(pieces: ArchivePieceData[]): ArchiveYear[] {
  const years = new Map<string, Map<string, ArchivePieceData[]>>();
  for (const piece of pieces) {
    const year = toYear(piece.created_at);
    const collection = piece.collection?.name ?? LOOSE_COLLECTION;
    const shelves = years.get(year) ?? new Map<string, ArchivePieceData[]>();
    shelves.set(collection, [...(shelves.get(collection) ?? []), piece]);
    years.set(year, shelves);
  }
  let position = 0;
  return [...years.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, shelves]) => ({
      year,
      count: [...shelves.values()].reduce(
        (total, list) => total + list.length,
        0,
      ),
      shelves: [...shelves.entries()].map(([collection, list]) => {
        const startIndex = position;
        position += list.length;
        return { collection, startIndex, pieces: list };
      }),
    }));
}

// Where a piece came from and where it went, in one line under its name.
export function toProvenance(
  createdAt: string,
  glaze: string | null,
  clayBody: string,
  stock: number,
): string {
  return [
    toMadeLabel(createdAt),
    glaze?.trim() || null,
    clayBody.trim() || null,
    stock <= 0 ? "has found a home" : "no longer on the shelf",
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
}
