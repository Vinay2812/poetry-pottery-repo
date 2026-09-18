import type { CommissionRequestInput } from "@/graphql/generated/graphql";

import type { CommissionFormValues } from "@/lib/validations/commission";

import { buildWhatsAppUrl } from "@/features/layout/types";

export interface CommissionStep {
  title: string;
  detail: string;
}

// A glaze as the brief form shows it: the name is what gets filed, the colour is the swatch.
export interface GlazeChoice {
  slug: string;
  name: string;
  colorCode: string | null;
}

// A piece the studio throws to order and the sizes its pages carry; none means the size is typed.
export interface PieceChoice {
  name: string;
  sizes: string[];
}

export function toPieceChoices(
  pieces: readonly { name: string; sizes: readonly string[] }[],
): PieceChoice[] {
  return pieces.map((piece) => ({ name: piece.name, sizes: [...piece.sizes] }));
}

export function toSizesForPiece(
  pieces: readonly PieceChoice[],
  pieceType: string,
): string[] {
  return pieces.find((piece) => piece.name === pieceType)?.sizes ?? [];
}

export function toGlazeChoices(
  glazes: readonly { slug: string; name: string; color_code: string | null }[],
): GlazeChoice[] {
  return glazes.map((glaze) => ({
    slug: glaze.slug,
    name: glaze.name,
    colorCode: glaze.color_code,
  }));
}

// The real sequence a commission runs through, with the two waits it actually has.
export const COMMISSION_STEPS: CommissionStep[] = [
  {
    title: "You send the brief",
    detail: "The piece, the size, the glaze and the words, in the form below.",
  },
  {
    title: "We sketch it, within two days",
    detail: "A drawing and a price come back by email. Nothing is owed yet.",
  },
  {
    title: "It is thrown",
    detail: "One sitting at the wheel, then a week drying to leather-hard.",
  },
  {
    title: "It is glazed and fired",
    detail:
      "Bisque, then the glaze firing at 1225°C. The kiln decides the rest.",
  },
  {
    title: "It ships, about ten days in",
    detail: "Packed in straw and paper, tracked, to the address you give us.",
  },
];

export function toCommissionInput(
  values: CommissionFormValues,
  referenceImageUrls: string[],
): CommissionRequestInput {
  return {
    piece_type: values.pieceType,
    size: values.size,
    glaze: values.glaze,
    carved_words: values.carvedWords.length > 0 ? values.carvedWords : null,
    notes: values.notes.length > 0 ? values.notes : null,
    name: values.name,
    email: values.email,
    phone: values.phone.length > 0 ? values.phone : null,
    reference_image_urls: referenceImageUrls,
  };
}

// The same brief, written out for someone who would rather send it on WhatsApp.
export function toCommissionMessage(values: CommissionFormValues): string {
  const lines = [
    "Hi, I would like a piece made to order.",
    values.pieceType ? `Piece: ${values.pieceType}` : null,
    values.size ? `Size: ${values.size}` : null,
    values.glaze ? `Glaze: ${values.glaze}` : null,
    values.carvedWords ? `Words to carve: ${values.carvedWords}` : null,
    values.notes ? `Notes: ${values.notes}` : null,
  ];
  return lines.filter((line): line is string => line !== null).join("\n");
}

export function toCommissionAskUrl(
  whatsappNumber: string,
  values: CommissionFormValues,
): string | null {
  if (whatsappNumber.replace(/\D/g, "").length === 0) return null;
  return buildWhatsAppUrl(whatsappNumber, toCommissionMessage(values));
}

// A brief that came back with a reference is worth repeating back in one line.
export function toBriefSummary(
  pieceType: string,
  size: string,
  glaze: string,
): string {
  return [pieceType, size, glaze]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" · ");
}
