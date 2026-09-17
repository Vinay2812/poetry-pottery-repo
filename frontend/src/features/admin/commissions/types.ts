import { CommissionStatus } from "@/graphql/generated/graphql";

import type { AdminStatusTone } from "@/features/admin/ui";

export const COMMISSIONS_PAGE_SIZE = 20;

export interface CommissionRow {
  id: string;
  pieceType: string;
  size: string;
  glaze: string;
  carvedWords: string | null;
  notes: string | null;
  name: string;
  email: string;
  phone: string | null;
  referenceImageUrls: string[];
  isRead: boolean;
  status: CommissionStatus;
  createdAt: string;
}

export function toCommissionRow(request: {
  id: string;
  piece_type: string;
  size: string;
  glaze: string;
  carved_words: string | null;
  notes: string | null;
  name: string;
  email: string;
  phone: string | null;
  reference_image_urls: string[];
  is_read: boolean;
  status: CommissionStatus;
  created_at: string;
}): CommissionRow {
  return {
    id: request.id,
    pieceType: request.piece_type,
    size: request.size,
    glaze: request.glaze,
    carvedWords: request.carved_words,
    notes: request.notes,
    name: request.name,
    email: request.email,
    phone: request.phone,
    referenceImageUrls: request.reference_image_urls,
    isRead: request.is_read,
    status: request.status,
    createdAt: request.created_at,
  };
}

export function commissionStatusTone(
  status: CommissionStatus,
): AdminStatusTone {
  if (status === CommissionStatus.Accepted) return "live";
  if (status === CommissionStatus.Declined) return "quiet";
  return "warn";
}

/** The URL only ever holds a string, so an unknown status filter is simply dropped. */
export function toCommissionStatus(
  value: string | undefined,
): CommissionStatus | null {
  const members: string[] = Object.values(CommissionStatus);
  return value && members.includes(value) ? (value as CommissionStatus) : null;
}

/** The brief in one line, the way the studio reads it off the bench. */
export function describeBrief(
  pieceType: string,
  size: string,
  glaze: string,
): string {
  return [pieceType, size, glaze].filter(Boolean).join(" · ");
}

/** WhatsApp wants a bare country-coded number and a pre-typed first line. */
export function toWhatsAppHref(
  phone: string | null,
  name: string,
  pieceType: string,
): string | null {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length < 10) return null;
  const number = digits.length === 10 ? `91${digits}` : digits;
  const text = `Hi ${name}, thanks for the ${pieceType.toLowerCase()} brief. A few thoughts from the studio:`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export type CommissionPatch =
  | { kind: "status"; id: string; status: CommissionStatus }
  | { kind: "read"; id: string };

export function applyCommissionPatch(
  rows: CommissionRow[],
  patch: CommissionPatch,
): CommissionRow[] {
  return rows.map((row) => {
    if (row.id !== patch.id) return row;
    if (patch.kind === "read") return { ...row, isRead: true };
    // Moving a brief off NEW means someone has looked at it.
    return {
      ...row,
      status: patch.status,
      isRead: patch.status === CommissionStatus.New ? row.isRead : true,
    };
  });
}
