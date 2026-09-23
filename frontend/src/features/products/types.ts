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
  glazes: string[];
  collection: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  customizableOnly: boolean;
  secondsOnly: boolean;
  isArchive: boolean;
  sort: ProductSort;
}

export const EMPTY_FILTERS: ProductFilters = {
  search: "",
  categories: [],
  materials: [],
  glazes: [],
  collection: null,
  minPrice: null,
  maxPrice: null,
  inStockOnly: false,
  customizableOnly: false,
  secondsOnly: false,
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
    glazes: readList(params, "glaze"),
    collection: params.get("collection"),
    minPrice: readInt(params, "min"),
    maxPrice: readInt(params, "max"),
    inStockOnly: params.get("in_stock") === "1",
    customizableOnly: params.get("customizable") === "true",
    secondsOnly: params.get("seconds") === "1",
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
  | { type: "glaze"; slug: string }
  | { type: "price"; min: number | null; max: number | null }
  | { type: "inStock"; value: boolean }
  | { type: "customizable"; value: boolean }
  | { type: "seconds"; value: boolean }
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
    case "glaze":
      return { ...current, glazes: toggle(current.glazes, action.slug) };
    case "price":
      return { ...current, minPrice: action.min, maxPrice: action.max };
    case "inStock":
      return { ...current, inStockOnly: action.value };
    case "customizable":
      return { ...current, customizableOnly: action.value };
    case "seconds":
      return { ...current, secondsOnly: action.value };
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
  if (filters.glazes.length) params.set("glaze", filters.glazes.join(","));
  if (filters.collection) params.set("collection", filters.collection);
  if (filters.minPrice !== null) params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("max", String(filters.maxPrice));
  if (filters.inStockOnly) params.set("in_stock", "1");
  if (filters.customizableOnly) params.set("customizable", "true");
  if (filters.secondsOnly) params.set("seconds", "1");
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
    glaze_slugs: filters.glazes.length ? filters.glazes : null,
    collection_slug: filters.collection,
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    in_stock_only: filters.inStockOnly || null,
    customizable_only: filters.customizableOnly || null,
    seconds_only: filters.secondsOnly || null,
    archive: filters.isArchive,
    sort: filters.sort,
    page,
    limit: PAGE_SIZE,
  };
}

// The server and the browser both derive this from the URL, so equal keys mean the same first page.
export function toFilterKey(input: ProductsFilterInput): string {
  return JSON.stringify(input);
}

export function countActiveFilters(filters: ProductFilters): number {
  return (
    filters.categories.length +
    (filters.collection ? 1 : 0) +
    filters.materials.length +
    filters.glazes.length +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.customizableOnly ? 1 : 0) +
    (filters.secondsOnly ? 1 : 0)
  );
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

// A second still says what is left in the batch; both facts share the card's one reserved line.
export function toCardStatusLine(
  isSecond: boolean,
  tone: StockTone,
  stockLabel: string,
): string | null {
  const parts = [
    isSecond ? "Second" : null,
    tone === "in_stock" ? null : stockLabel,
  ].filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export const SECOND_HEADING = "What is different about this one";

// Every second should carry its own note; until it does, the page still admits what it is.
export function toFlawNote(flawNote: string | null): string {
  return (
    flawNote?.trim() ||
    "This one came out of the kiln with a mark, so it leaves the studio at a lower price."
  );
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

// An archived piece sends its admirer to the commission form with itself as the reference.
export function toArchiveCommissionPath(productSlug: string): string {
  return `/custom?like=${encodeURIComponent(productSlug)}`;
}

// The WhatsApp way to ask carries the piece name and its page so the studio knows what is meant.
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

// Nobody should have to pick a size to see a price, so every required choice opens
// on its first option and the buy box is priced from the start.
export function toDefaultSelections(
  groups: ProductOptionGroupData[],
): Selections {
  const selections: Selections = {};
  for (const group of groups) {
    if (group.kind === OptionGroupKind.Text || !group.is_required) continue;
    const first = group.options[0];
    if (first) selections[group.id] = { optionId: first.id };
  }
  return selections;
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

// A url can name a price the shelf no longer reaches; the handles and the labels
// under them have to agree on the bounds the slider actually offers.
export function clampPriceRange(
  range: [number, number],
  floor: number,
  ceiling: number,
): [number, number] {
  const low = Math.min(Math.max(range[0], floor), ceiling);
  const high = Math.max(Math.min(range[1], ceiling), low);
  return [low, high];
}

export function toProductPath(slug: string): string {
  return `/products/${slug}`;
}

export function toGlazePath(slug: string): string {
  return `/products?glaze=${slug}`;
}

// Whole numbers lose the decimal point: 8.0 cm is written 8 cm, 9.5 cm stays 9.5 cm.
export function formatCentimetres(value: number | null): string | null {
  if (value === null || !Number.isFinite(value) || value <= 0) return null;
  return `${Number(value.toFixed(1))} cm`;
}

export function formatCapacity(millilitres: number | null): string | null {
  if (millilitres === null || millilitres <= 0) return null;
  return `${millilitres} ml`;
}

export function formatWeight(grams: number | null): string | null {
  if (grams === null || grams <= 0) return null;
  return `${grams} g`;
}

// The studio's own words first; measurements only stand in when nobody wrote a size.
export function toSizeLine(
  dimensions: string | null,
  heightCm: number | null,
  diameterCm: number | null,
): string | null {
  const written = dimensions?.trim();
  if (written) return written;
  const height = formatCentimetres(heightCm);
  const across = formatCentimetres(diameterCm);
  if (height && across) return `${height} tall, ${across} across`;
  return height ?? (across ? `${across} across` : null);
}

export interface FactRow {
  label: string;
  value: string;
}

export interface PieceFacts {
  material: string;
  glazeName: string | null;
  dimensions: string | null;
  heightCm: number | null;
  diameterCm: number | null;
  capacityMl: number | null;
  weightG: number | null;
  isCustomizable: boolean;
  sizeChoices: string[];
}

// The kiln card: clay body, glaze and size always have something to say, the
// measurements only appear once the studio has taken them.
export function toFactRows(facts: PieceFacts): FactRow[] {
  const glaze =
    facts.glazeName ?? (facts.isCustomizable ? "Chosen with you" : null);
  const size =
    toSizeLine(facts.dimensions, facts.heightCm, facts.diameterCm) ??
    (facts.sizeChoices.length > 0 ? facts.sizeChoices.join(", ") : null);
  const rows: [string, string | null][] = [
    ["Clay body", facts.material],
    ["Glaze", glaze],
    ["Size", size],
    ["Capacity", formatCapacity(facts.capacityMl)],
    ["Weight", formatWeight(facts.weightG)],
    ["Made in", "Sangli, Maharashtra"],
    [
      "Ships in",
      facts.isCustomizable ? "About ten days" : "Three working days",
    ],
  ];
  return rows.flatMap(([label, value]) => (value ? [{ label, value }] : []));
}

// The drawing is measured in tenths of a centimetre, so a path number is never
// rounded past a millimetre.
const SCALE_UNITS_PER_CM = 10;
const SCALE_GAP = 26;
const SCALE_PAD = 8;
const SCALE_CAPTION = 30;

export interface PieceScale {
  width: number;
  height: number;
  minY: number;
  pieceX: number;
  pieceHeight: number;
  pieceWidth: number;
  cupX: number;
  cupHeight: number;
  cupWidth: number;
}

/**
 * Two silhouettes on one floor at the size they really are: the piece, and an
 * ordinary 250 ml cup to measure it against.
 */
export function toPieceScale(
  pieceHeightCm: number,
  pieceDiameterCm: number,
  cupHeightCm: number,
  cupDiameterCm: number,
): PieceScale {
  const pieceHeight = pieceHeightCm * SCALE_UNITS_PER_CM;
  const pieceWidth = pieceDiameterCm * SCALE_UNITS_PER_CM;
  const cupHeight = cupHeightCm * SCALE_UNITS_PER_CM;
  const cupWidth = cupDiameterCm * SCALE_UNITS_PER_CM;
  const pieceX = SCALE_PAD + pieceWidth / 2;
  const cupX = pieceX + pieceWidth / 2 + SCALE_GAP + cupWidth / 2;
  const tallest = Math.max(pieceHeight, cupHeight);
  return {
    width: cupX + cupWidth / 2 + SCALE_PAD,
    height: tallest + SCALE_PAD + SCALE_CAPTION,
    minY: -(tallest + SCALE_PAD),
    pieceX,
    pieceHeight,
    pieceWidth,
    cupX,
    cupHeight,
    cupWidth,
  };
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

export const MAX_REFERENCE_PHOTOS = 3;
export const MAX_REFERENCE_PHOTO_BYTES = 8 * 1024 * 1024;
const REFERENCE_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const REFERENCE_PHOTO_ACCEPT = REFERENCE_PHOTO_TYPES.join(",");

export interface ReferencePhoto {
  id: string;
  name: string;
  previewUrl: string;
  progress: number;
  url: string | null;
  error: string | null;
}

// The API repeats every one of these checks; this only saves the customer a round trip.
export function validateReferencePhoto(file: {
  type: string;
  size: number;
}): string | null {
  if (!REFERENCE_PHOTO_TYPES.some((type) => type === file.type)) {
    return "Use a JPEG, PNG or WebP photo";
  }
  if (file.size <= 0 || file.size > MAX_REFERENCE_PHOTO_BYTES) {
    return "Photos must be under 8 MB";
  }
  return null;
}

export function remainingReferenceSlots(count: number): number {
  return Math.max(0, MAX_REFERENCE_PHOTOS - count);
}

// Only photos the server confirmed travel with the line; the rest are still local previews.
export function toConfirmedPhotoUrls(photos: ReferencePhoto[]): string[] {
  return photos
    .map((photo) => photo.url)
    .filter((url): url is string => url !== null);
}

export function isPhotoUploadPending(photos: ReferencePhoto[]): boolean {
  return photos.some((photo) => photo.url === null && photo.error === null);
}
