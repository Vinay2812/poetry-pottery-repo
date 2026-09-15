import {
  OptionGroupKind,
  type ProductCardFragment,
  type ProductQuery,
  ProductSort,
  type ProductsFilterInput,
} from "@/graphql/generated/graphql";

export type ProductCardData = ProductCardFragment;
export type ProductDetailData = ProductQuery["product"];
export type ProductOptionGroupData = ProductDetailData["option_groups"][number];

const PAGE_SIZE = 24;
const LOW_STOCK_THRESHOLD = 5;

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
    sort:
      sort && SORT_VALUES.has(sort)
        ? (sort as ProductSort)
        : ProductSort.Featured,
  };
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
    sort: filters.sort,
    page,
    limit: PAGE_SIZE,
  };
}

export function countActiveFilters(filters: ProductFilters): number {
  return (
    filters.categories.length +
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

export function toStockStatus(
  stock: number,
  isCustomizable: boolean,
): StockStatus {
  if (isCustomizable) return { tone: "made_to_order", label: "Made to order" };
  if (stock <= 0) return { tone: "sold_out", label: "Sold out" };
  if (stock <= LOW_STOCK_THRESHOLD)
    return { tone: "low", label: `Only ${stock} left` };
  return { tone: "in_stock", label: "In stock" };
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
