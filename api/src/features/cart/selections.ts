import { createHash } from "node:crypto";

import { BadRequestException } from "@nestjs/common";
import { OptionGroupKind } from "@prisma/client";

export interface SelectionInput {
  group_id: number;
  option_id?: number | null;
  text?: string | null;
}

export interface OptionGroupRow {
  id: number;
  name: string;
  kind: OptionGroupKind;
  is_required: boolean;
  price_modifier: number;
  max_length: number | null;
  options: {
    id: number;
    name: string;
    price_modifier: number;
    is_active: boolean;
  }[];
}

export type Selection = PrismaJson.ProductSelection;
export type Customisation = PrismaJson.ProductCustomisation;

export const MAX_REFERENCE_IMAGES = 3;

// Older rows stored a bare option array; newer ones carry reference photos alongside.
export function readCustomisation(
  stored: PrismaJson.ProductSelections | null | undefined,
): Customisation {
  if (!stored) return { options: [], reference_image_urls: [] };
  if (Array.isArray(stored)) {
    return { options: stored, reference_image_urls: [] };
  }
  return {
    options: stored.options ?? [],
    reference_image_urls: stored.reference_image_urls ?? [],
  };
}

// Only URLs we handed out through a presigned upload are ever stored.
export function resolveReferenceImages(
  urls: readonly string[] | null | undefined,
  isOwnUrl: (url: string) => boolean,
): string[] {
  const cleaned = (urls ?? []).map((url) => url.trim()).filter(Boolean);
  const unique = [...new Set(cleaned)];
  if (unique.length > MAX_REFERENCE_IMAGES) {
    throw new BadRequestException(
      `Attach up to ${MAX_REFERENCE_IMAGES} reference photos`,
    );
  }
  for (const url of unique) {
    if (!isOwnUrl(url)) {
      throw new BadRequestException("That reference photo was not uploaded");
    }
  }
  return unique;
}

// Turns client choices into priced snapshots using the live option rows, never client prices.
export function resolveSelections(
  groups: OptionGroupRow[],
  inputs: SelectionInput[],
): Selection[] {
  const byGroup = new Map(inputs.map((input) => [input.group_id, input]));
  const resolved: Selection[] = [];

  for (const group of groups) {
    const input = byGroup.get(group.id);
    if (group.kind === OptionGroupKind.TEXT) {
      const text = input?.text?.trim() ?? "";
      if (!text) {
        if (group.is_required) {
          throw new BadRequestException(`${group.name} is required`);
        }
        continue;
      }
      if (group.max_length !== null && text.length > group.max_length) {
        throw new BadRequestException(
          `${group.name} must be ${group.max_length} characters or fewer`,
        );
      }
      resolved.push({
        group_id: group.id,
        group_name: group.name,
        option_id: null,
        option_name: null,
        text,
        price_modifier: group.price_modifier,
      });
      continue;
    }

    const optionId = input?.option_id ?? null;
    if (optionId === null) {
      if (group.is_required) {
        throw new BadRequestException(`Choose a ${group.name.toLowerCase()}`);
      }
      continue;
    }
    const option = group.options.find(
      (candidate) => candidate.id === optionId && candidate.is_active,
    );
    if (!option) {
      throw new BadRequestException(
        `That ${group.name.toLowerCase()} is no longer available`,
      );
    }
    resolved.push({
      group_id: group.id,
      group_name: group.name,
      option_id: option.id,
      option_name: option.name,
      text: null,
      price_modifier: option.price_modifier,
    });
  }

  const known = new Set(groups.map((group) => group.id));
  for (const input of inputs) {
    if (!known.has(input.group_id)) {
      throw new BadRequestException("Unknown customisation option");
    }
  }

  return resolved;
}

// Same choices and photos in any order produce the same key, so they merge into one cart line.
export function selectionKey(
  selections: Selection[],
  referenceImageUrls: readonly string[] = [],
): string {
  if (selections.length === 0 && referenceImageUrls.length === 0) return "";
  const normalised = JSON.stringify([
    [...selections]
      .sort((a, b) => a.group_id - b.group_id)
      .map((s) => [s.group_id, s.option_id, s.text]),
    [...referenceImageUrls].sort(),
  ]);
  return createHash("sha256").update(normalised).digest("hex").slice(0, 32);
}

export function selectionsTotal(selections: Selection[]): number {
  return selections.reduce(
    (sum, selection) => sum + selection.price_modifier,
    0,
  );
}
