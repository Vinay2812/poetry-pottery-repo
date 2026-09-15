import {
  OptionGroupKind,
  type ProductCardFragment,
  type ProductQuery,
  ProductSort,
  type ProductsFilterInput,
} from "@/graphql/generated/graphql";

import { buildWhatsAppUrl } from "@/features/layout/types";

export type ProductCardData = ProductCardFragment;
export type ProductDetailData = ProductQuery["product"];
export type ProductOptionGroupData = ProductDetailData["option_groups"][number];

export const ARCHIVE_VIEW = "archive";

const PAGE_SIZE = 24;
const LOW_STOCK_THRESHOLD = 3;
const MAX_DESCRIPTION_SENTENCES = 3;

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: ProductSort.Featured, label: "Featured" },
  { value: ProductSort.Newest, label: "New arrivals" },
  { value: ProductSort.BestSelling, label: "Best sellers" },
  { value: ProductSort.PriceLowToHigh, label: "Price: low to high" },
  { value: ProductSort.PriceHighToLow, label: "Price: high to low" },
  { value: ProductSort.TopRated, label: "Top rated" },
];

export interface ProductFilters {
  search: string;
  categories: string[];
  materials: string[];
  collection: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  customizableOnly: boolean;
  isArchive: boolean;
  sort: ProductSort;
}

export const EMPTY_FILTERS: ProductFilters = {
  search: "",
  categories: [],
  materials: [],
  collection: null,
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  customizableOnly: false,
  isArchive: false,
  sort: ProductSort.Featured,
};

const SORT_VALUES = new Set<string>(Object.values(ProductSort));

function readList(params: URLSearchParams, key: string): string[] {
  return params
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function readInt(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (raw === null) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parseFilters(params: URLSearchParams): ProductFilters {
  const sort = params.get("sort");
  return {
    search: params.get("q")?.trim() ?? "",
    categories: readList(params, "category"),
    materials: readList(params, "material"),
    collection: params.get("collection"),
    minPrice: readInt(params, "min"),
    maxPrice: readInt(params, "max"),
    inStockOnly: params.get("in_stock") === "1",
    customizableOnly: params.get("customizable") === "true",
    isArchive: params.get("view") === ARCHIVE_VIEW,
    sort:
      sort && SORT_VALUES.has(sort)
        ? (sort as ProductSort)
        : ProductSort.Featured,
  };
}

export type FilterAction =
  | { type: "search"; value: string }
  | { type: "category"; slug: string }
  | { type: "collection"; slug: string }
  | { type: "material"; material: string }
  | { type: "price"; min: number | null; max: number | null }
  | { type: "inStock"; value: boolean }
  | { type: "customizable"; value: boolean }
  | { type: "sort"; sort: ProductSort }
  | { type: "view"; isArchive: boolean }
  | { type: "clear" };

function toggle(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

// One reducer for the URL and for the optimistic layer, so a click and its navigation agree.
export function applyFilterAction(
  current: ProductFilters,
  action: FilterAction,
): ProductFilters {
  switch (action.type) {
    case "search":
      return { ...current, search: action.value.trim() };
    case "category":
      return {
        ...current,
        categories: toggle(current.categories, action.slug),
      };
    case "collection":
      return {
        ...current,
        collection: current.collection === action.slug ? null : action.slug,
      };
    case "material":
      return {
        ...current,
        materials: toggle(current.materials, action.material),
      };
    case "price":
      return { ...current, minPrice: action.min, maxPrice: action.max };
    case "inStock":
      return { ...current, inStockOnly: action.value };
    case "customizable":
      return { ...current, customizableOnly: action.value };
    case "sort":
      return { ...current, sort: action.sort };
    case "view":
      return { ...current, isArchive: action.isArchive };
    case "clear":
      return { ...EMPTY_FILTERS, isArchive: current.isArchive };
  }
}

export function toSearchParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.categories.length)
    params.set("category", filters.categories.join(","));
  if (filters.materials.length)
    params.set("material", filters.materials.join(","));
  if (filters.collection) params.set("collection", filters.collection);
  if (filters.minPrice !== null) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("max", String(filters.maxPrice));
  if (filters.inStockOnly) params.set("in_stock", "1");
  if (filters.customizableOnly) params.set("customizable", "true");
  if (filters.isArchive) params.set("view", ARCHIVE_VIEW);
  if (filters.sort !== ProductSort.Featured) params.set("sort", filters.sort);
  return params;
}

export function toFilterInput(
  filters: ProductFilters,
  page: number,
): ProductsFilterInput {
  return {
    search: filters.search || null,
    category_slugs: filters.categories.length ? filters.categories : null,
    materials: filters.materials.length ? filters.materials : null,
    collection_slug: filters.collection,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    in_stock_only: filters.inStockOnly || null,
    customizable_only: filters.customizableOnly || null,
    archive: filters.isArchive,
    sort: filters.sort,
    page,
    limit: PAGE_SIZE,
  };
}

export function countActiveFilters(filters: ProductFilters): number {
  return (
    filters.categories.length +
    (filters.collection ? 1 : 0) +
    filters.materials.length +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.customizableOnly ? 1 : 0)
  );
}

export function toDiscountPercent(
  price: number,
  compareAt: number | null,
): number | null {
  if (compareAt === null || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export type StockTone = "in_stock" | "low" | "sold_out" | "made_to_order";

export interface StockStatus {
  tone: StockTone;
  label: string;
}

// Plain state text, never an alarm: a batch either has pieces left or is being thrown again.
export function toStockStatus(
  stock: number,
  isCustomizable: boolean,
): StockStatus {
  if (isCustomizable) return { tone: "made_to_order", label: "Made to order" };
  if (stock <= 0)
    return { tone: "sold_out", label: "Sold out \u00b7 next batch soon" };
  if (stock <= LOW_STOCK_THRESHOLD)
    return { tone: "low", label: `Only ${stock}` };
  return { tone: "in_stock", label: "Ready to ship" };
}

// The product page counts the batch rather than an inventory number.
export function toBatchLabel(stock: number, isCustomizable: boolean): string {
  if (isCustomizable) return "Made to order, thrown in about ten days";
  if (stock <= 0) return "Sold out \u00b7 next batch soon";
  if (stock === 1) return "One made in this batch";
  return `${stock} made in this batch`;
}

export const STUDIO_NOTE =
  "Each piece is thrown by hand, so expect small differences.";

// Description copy is trimmed to three sentences; the rest sits behind a toggle.
export function toShortDescription(description: string): {
  short: string;
  hasMore: boolean;
} {
  const sentences = description.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [];
  if (sentences.length <= MAX_DESCRIPTION_SENTENCES) {
    return { short: description.trim(), hasMore: false };
  }
  return {
    short: sentences.slice(0, MAX_DESCRIPTION_SENTENCES).join("").trim(),
    hasMore: true,
  };
}

// Archive cards say where the piece went, never a stock number.
export function toArchiveLabel(stock: number): string {
  return stock <= 0 ? "Found a home" : "Retired from the shelf";
}

export function toArchiveNote(stock: number): string {
  return stock <= 0
    ? "This piece has found a home."
    : "This piece is no longer on the shelf.";
}

// "Ask for one like it" carries the piece name and its page so the studio knows what is meant.
export function toArchiveAskUrl(
  whatsappNumber: string,
  productName: string,
  productUrl: string,
): string | null {
  const digits = whatsappNumber.replace(/\D/g, "");
  if (!digits) return null;
  return buildWhatsAppUrl(
    whatsappNumber,
    `Hi, I saw the ${productName} in your archive (${productUrl}). Could you make one like it?`,
  );
}

export function toGlazeAskUrl(
  whatsappNumber: string,
  productName: string,
): string | null {
  const digits = whatsappNumber.replace(/\D/g, "");
  if (!digits) return null;
  const text = `Hi, about the ${productName} \u2014 could I have it in another glaze or size?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

type SelectionValue = { optionId: number } | { text: string };
export type Selections = Record<number, SelectionValue>;

export interface SelectionIssue {
  groupId: number;
  message: string;
}

export function computeUnitPrice(
  basePrice: number,
  groups: ProductOptionGroupData[],
  selections: Selections,
): number {
  return groups.reduce((total, group) => {
    const selection = selections[group.id];
    if (!selection) return total;
    if (group.kind === OptionGroupKind.Text) {
      return "text" in selection && selection.text.trim()
        ? total + group.price_modifier
        : total;
    }
    if ("optionId" in selection) {
      const option = group.options.find(
        (candidate) => candidate.id === selection.optionId,
      );
      return option ? total + option.price_modifier : total;
    }
    return total;
  }, basePrice);
}

export function validateSelections(
  groups: ProductOptionGroupData[],
  selections: Selections,
): SelectionIssue[] {
  const issues: SelectionIssue[] = [];
  for (const group of groups) {
    const selection = selections[group.id];
    if (group.kind === OptionGroupKind.Text) {
      const text =
        selection && "text" in selection ? selection.text.trim() : "";
      if (group.is_required && !text) {
        issues.push({
          groupId: group.id,
          message: `Add your ${group.name.toLowerCase()}`,
        });
      } else if (group.max_length !== null && text.length > group.max_length) {
        issues.push({
          groupId: group.id,
          message: `Keep it under ${group.max_length} characters`,
        });
      }
    } else if (group.is_required && !(selection && "optionId" in selection)) {
      issues.push({
        groupId: group.id,
        message: `Choose a ${group.name.toLowerCase()}`,
      });
    }
  }
  return issues;
}

export function toProductPath(slug: string): string {
  return `/products/${slug}`;
}

export function toPhotoLabel(index: number, total: number): string {
  return `Photo ${index + 1} of ${total}`;
}

export function toPhotoAlt(name: string, index: number): string {
  return index === 0 ? name : `${name}, view ${index + 1}`;
}

export interface CardPhotoLoading {
  isPriority: boolean;
  isEager: boolean;
}

// The grid's first row is two cards on a phone and four on a desktop. All four load eagerly;
// only the first two ask for high fetch priority, so a phone never competes with a row it
// cannot see yet. Next 16 deprecated `priority`, so eagerness is set through `loading`.
export function toCardPhotoLoading(index: number): CardPhotoLoading {
  return { isPriority: index < 2, isEager: index < 4 };
}
