import {
  type AdminOptionGroupFieldsFragment,
  type AdminOptionGroupInput,
  type AdminOptionInput,
  type AdminProductDetailFragment,
  type AdminProductInput,
  type AdminProductsFilterInput,
  type AdminProductUpdateInput,
  OptionGroupKind,
} from "@/graphql/generated/graphql";

import { formatInr, pluralize } from "@/lib/format";
import type {
  OptionGroupFormValues,
  ProductFormValues,
  ProductOptionFormValues,
} from "@/lib/validations/admin/product";

import { formatEnumLabel, type QueryValues } from "@/features/admin/shell";

export const PIECES_PAGE_SIZE = 20;

/** The textarea is one note per line; blank lines are the maker breathing, not data. */
export function parseCareNotes(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function formatCareNotes(notes: readonly string[]): string {
  return notes.join("\n");
}

/** A count on a shelf is never negative, whatever a pending adjustment says. */
// Only stock or a made-to-order flag can put a piece on the shelf; the API refuses otherwise.
export function canGoLive(stock: number, isCustomizable: boolean): boolean {
  return isCustomizable || stock > 0;
}

export const LIVE_BLOCKED_NOTE = "Add stock first, or mark it made to order";

export function clampStock(stock: number): number {
  return Math.max(0, Math.round(stock));
}

export function applyStockDelta(stock: number, delta: number): number {
  return clampStock(stock + delta);
}

export function formatStock(stock: number): string {
  return String(clampStock(stock));
}

export function describeCategories(names: readonly string[]): string {
  return names.length > 0 ? names.join(", ") : "—";
}

export function formatPriceModifier(rupees: number): string {
  if (rupees === 0) return "No change";
  const sign = rupees > 0 ? "+" : "−";
  return `${sign}${formatInr(Math.abs(rupees))}`;
}

export function describeOptionGroup(
  kind: OptionGroupKind,
  optionCount: number,
  isRequired: boolean,
): string {
  const shape =
    kind === OptionGroupKind.Choice
      ? pluralize(optionCount, "option")
      : "Free text";
  return `${formatEnumLabel(kind)} · ${shape} · ${isRequired ? "required" : "optional"}`;
}

export function formatSortOrder(sortOrder: number): string {
  return `Order ${sortOrder}`;
}

export function describeMaxLength(maxLength: number | null): string | null {
  return maxLength === null
    ? null
    : `Up to ${pluralize(maxLength, "character")}`;
}

export function sortOptionGroups(
  groups: readonly AdminOptionGroupFieldsFragment[],
): AdminOptionGroupFieldsFragment[] {
  return [...groups].sort(
    (left, right) => left.sort_order - right.sort_order || left.id - right.id,
  );
}

function readNumberValue(value: string | undefined): number | null {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** Filters ride in the URL as "1" and "0" so a shared link means one thing. */
function readBooleanValue(value: string | undefined): boolean | null {
  if (value === "1") return true;
  if (value === "0") return false;
  return null;
}

export function toProductsFilter(
  values: QueryValues,
  page: number,
): AdminProductsFilterInput {
  return {
    page,
    limit: PIECES_PAGE_SIZE,
    search: values.search ?? null,
    category_id: readNumberValue(values.category_id),
    collection_id: readNumberValue(values.collection_id),
    is_active: readBooleanValue(values.is_active),
    is_featured: readBooleanValue(values.is_featured),
    low_stock: values.low_stock === "1" ? true : null,
    is_second: readBooleanValue(values.is_second),
    glaze_id: readNumberValue(values.glaze_id),
  };
}

/** Empty is a measurement the studio has not taken, not a zero. */
export function describeMeasurement(
  value: number | null,
  unit: string,
): string {
  return value === null ? "—" : `${value} ${unit}`;
}

/** The one line under the photos: what the piece is in the hand. */
export function describeSizeAndWeight(size: {
  capacityMl: number | null;
  heightCm: number | null;
  diameterCm: number | null;
  weightG: number | null;
}): string {
  const parts = [
    size.capacityMl === null ? null : `${size.capacityMl} ml`,
    size.heightCm === null ? null : `${size.heightCm} cm tall`,
    size.diameterCm === null ? null : `${size.diameterCm} cm across`,
    size.weightG === null ? null : `${size.weightG} g`,
  ].filter((part): part is string => part !== null);
  return parts.length === 0 ? "Not measured yet" : parts.join(" · ");
}

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  description: "",
  price: 0,
  compare_at_price: null,
  material: "",
  dimensions: "",
  color_name: "",
  color_code: "",
  stock: 0,
  care_notes: "",
  capacity_ml: null,
  height_cm: null,
  diameter_cm: null,
  weight_g: null,
  maker_note: "",
  category_ids: [],
  collection_id: null,
  glaze_id: null,
  is_customizable: false,
  is_second: false,
  flaw_note: "",
  is_commission: false,
  is_featured: false,
  is_active: true,
};

export function toProductFormValues(
  product: AdminProductDetailFragment,
): ProductFormValues {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    compare_at_price: product.compare_at_price,
    material: product.material,
    dimensions: product.dimensions ?? "",
    color_name: product.color_name ?? "",
    color_code: product.color_code ?? "",
    stock: product.stock,
    care_notes: formatCareNotes(product.care_notes),
    capacity_ml: product.capacity_ml,
    height_cm: product.height_cm,
    diameter_cm: product.diameter_cm,
    weight_g: product.weight_g,
    maker_note: product.maker_note ?? "",
    category_ids: product.categories.map((category) => category.id),
    collection_id: product.collection?.id ?? null,
    glaze_id: product.glaze?.id ?? null,
    is_customizable: product.is_customizable,
    is_second: product.is_second,
    flaw_note: product.flaw_note ?? "",
    is_commission: product.is_commission,
    is_featured: product.is_featured,
    is_active: product.is_active,
  };
}

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toProductInput(
  values: ProductFormValues,
  imageUrls: readonly string[],
): AdminProductInput {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    price: values.price,
    compare_at_price: values.compare_at_price,
    material: values.material.trim(),
    dimensions: optionalText(values.dimensions),
    color_name: optionalText(values.color_name),
    color_code: optionalText(values.color_code),
    stock: values.stock,
    care_notes: parseCareNotes(values.care_notes),
    capacity_ml: values.capacity_ml,
    height_cm: values.height_cm,
    diameter_cm: values.diameter_cm,
    weight_g: values.weight_g,
    maker_note: optionalText(values.maker_note),
    category_ids: values.category_ids,
    collection_id: values.collection_id,
    glaze_id: values.glaze_id,
    image_urls: [...imageUrls],
    is_customizable: values.is_customizable,
    is_second: values.is_second,
    flaw_note: optionalText(values.flaw_note),
    is_commission: values.is_commission,
    is_featured: values.is_featured,
    is_active: values.is_active,
  };
}

/** Active, featured and stock are not on the update input: each has its own mutation. */
export function toProductUpdateInput(
  values: ProductFormValues,
  imageUrls: readonly string[],
): AdminProductUpdateInput {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    price: values.price,
    compare_at_price: values.compare_at_price,
    material: values.material.trim(),
    dimensions: optionalText(values.dimensions),
    color_name: optionalText(values.color_name),
    color_code: optionalText(values.color_code),
    care_notes: parseCareNotes(values.care_notes),
    capacity_ml: values.capacity_ml,
    height_cm: values.height_cm,
    diameter_cm: values.diameter_cm,
    weight_g: values.weight_g,
    maker_note: optionalText(values.maker_note),
    category_ids: values.category_ids,
    collection_id: values.collection_id,
    glaze_id: values.glaze_id,
    image_urls: [...imageUrls],
    is_customizable: values.is_customizable,
    is_second: values.is_second,
    flaw_note: optionalText(values.flaw_note),
    is_commission: values.is_commission,
  };
}

export const EMPTY_OPTION_GROUP_FORM: OptionGroupFormValues = {
  name: "",
  kind: OptionGroupKind.Choice,
  is_required: false,
  sort_order: 0,
  price_modifier: 0,
  max_length: null,
};

export function toOptionGroupFormValues(
  group: AdminOptionGroupFieldsFragment,
): OptionGroupFormValues {
  return {
    name: group.name,
    kind: group.kind,
    is_required: group.is_required,
    sort_order: group.sort_order,
    price_modifier: group.price_modifier,
    max_length: group.max_length,
  };
}

export function toOptionGroupInput(
  values: OptionGroupFormValues,
): AdminOptionGroupInput {
  return {
    name: values.name.trim(),
    kind: values.kind,
    is_required: values.is_required,
    sort_order: values.sort_order,
    price_modifier: values.price_modifier,
    max_length: values.kind === OptionGroupKind.Text ? values.max_length : null,
  };
}

export const EMPTY_OPTION_FORM: ProductOptionFormValues = {
  name: "",
  price_modifier: 0,
  sort_order: 0,
  is_active: true,
};

export function toOptionInput(
  values: ProductOptionFormValues,
): AdminOptionInput {
  return {
    name: values.name.trim(),
    price_modifier: values.price_modifier,
    sort_order: values.sort_order,
    is_active: values.is_active,
  };
}
