import type { UploadFolder } from "@/storage/storage.service";
import { ImageSpec, UploadPurpose } from "./uploads.type";

export const RATIO_TOLERANCE = 0.02;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
// sharp reads an AVIF through the heif loader, so the format it reports is "heif".
export const ALLOWED_FORMATS = ["jpeg", "png", "webp", "heif"] as const;
// The other heif compressions are HEIC, which browsers outside Safari will not render.
export const AVIF_COMPRESSION = "av1";
export const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const CONTENT_TYPE_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

// The table in docs/design/direction.md, in one place the API and the console can both read.
export const IMAGE_SPECS: Record<UploadPurpose, ImageSpec> = {
  [UploadPurpose.PRODUCT]: {
    purpose: UploadPurpose.PRODUCT,
    ratio_label: "1:1",
    ratio: 1,
    min_width: 1000,
    min_height: 1000,
    max_bytes: MAX_IMAGE_BYTES,
    content_types: ALLOWED_CONTENT_TYPES,
    renders_at: "cards, gallery, cart lines",
  },
  [UploadPurpose.CATEGORY]: {
    purpose: UploadPurpose.CATEGORY,
    ratio_label: "1:1",
    ratio: 1,
    min_width: 600,
    min_height: 600,
    max_bytes: MAX_IMAGE_BYTES,
    content_types: ALLOWED_CONTENT_TYPES,
    renders_at: "category tiles",
  },
  [UploadPurpose.GLAZE]: {
    purpose: UploadPurpose.GLAZE,
    ratio_label: "1:1",
    ratio: 1,
    min_width: 600,
    min_height: 600,
    max_bytes: MAX_IMAGE_BYTES,
    content_types: ALLOWED_CONTENT_TYPES,
    renders_at: "glaze swatches",
  },
  [UploadPurpose.COLLECTION]: {
    purpose: UploadPurpose.COLLECTION,
    ratio_label: "3:2",
    ratio: 3 / 2,
    min_width: 1200,
    min_height: 800,
    max_bytes: MAX_IMAGE_BYTES,
    content_types: ALLOWED_CONTENT_TYPES,
    renders_at: "collection rows",
  },
  [UploadPurpose.EVENT]: {
    purpose: UploadPurpose.EVENT,
    ratio_label: "4:3",
    ratio: 4 / 3,
    min_width: 1200,
    min_height: 900,
    max_bytes: MAX_IMAGE_BYTES,
    content_types: ALLOWED_CONTENT_TYPES,
    renders_at: "event cards and detail",
  },
  [UploadPurpose.HERO]: {
    purpose: UploadPurpose.HERO,
    ratio_label: "16:9",
    ratio: 16 / 9,
    min_width: 1600,
    min_height: 900,
    max_bytes: MAX_IMAGE_BYTES,
    content_types: ALLOWED_CONTENT_TYPES,
    renders_at: "home hero, about landscape, workshop intro",
  },
  // Content pages carry the same landscape hero as the home page.
  [UploadPurpose.CONTENT]: {
    purpose: UploadPurpose.CONTENT,
    ratio_label: "16:9",
    ratio: 16 / 9,
    min_width: 1600,
    min_height: 900,
    max_bytes: MAX_IMAGE_BYTES,
    content_types: ALLOWED_CONTENT_TYPES,
    renders_at: "content page heroes",
  },
  // A photo of the piece packed or on the wheel, sent with a note from the studio.
  [UploadPurpose.ORDER_NOTE]: {
    purpose: UploadPurpose.ORDER_NOTE,
    ratio_label: "4:3",
    ratio: 4 / 3,
    min_width: 1200,
    min_height: 900,
    max_bytes: MAX_IMAGE_BYTES,
    content_types: ALLOWED_CONTENT_TYPES,
    renders_at: "studio notes on an order",
  },
  [UploadPurpose.REVIEW]: {
    purpose: UploadPurpose.REVIEW,
    ratio_label: "any",
    ratio: null,
    min_width: 400,
    min_height: 400,
    max_bytes: MAX_IMAGE_BYTES,
    content_types: ALLOWED_CONTENT_TYPES,
    renders_at: "review photos",
  },
};

const PURPOSE_FOLDER: Record<UploadPurpose, UploadFolder> = {
  [UploadPurpose.PRODUCT]: "products",
  [UploadPurpose.CATEGORY]: "categories",
  [UploadPurpose.GLAZE]: "glazes",
  [UploadPurpose.COLLECTION]: "collections",
  [UploadPurpose.EVENT]: "events",
  [UploadPurpose.HERO]: "hero",
  [UploadPurpose.CONTENT]: "content",
  [UploadPurpose.REVIEW]: "reviews",
  [UploadPurpose.ORDER_NOTE]: "orders",
};

export function folderFor(purpose: UploadPurpose): UploadFolder {
  return PURPOSE_FOLDER[purpose];
}

export function extensionFor(contentType: string): string {
  return CONTENT_TYPE_EXTENSION[contentType] ?? "img";
}

export interface ImageMeta {
  width: number | undefined;
  height: number | undefined;
  format: string | undefined;
  compression?: string | undefined;
  bytes: number;
}

function isAllowedFormat(meta: ImageMeta): boolean {
  if (!meta.format || !ALLOWED_FORMATS.some((f) => f === meta.format)) {
    return false;
  }
  return meta.format !== "heif" || meta.compression === AVIF_COMPRESSION;
}

// EXIF orientations 5 to 8 store the photo a quarter turn from how it is shown, so the
// stored width and height are the wrong way round for the spec table.
export function orientedSize(meta: {
  width?: number;
  height?: number;
  orientation?: number;
}): { width: number | undefined; height: number | undefined } {
  const quarterTurn = (meta.orientation ?? 1) >= 5;
  return quarterTurn
    ? { width: meta.height, height: meta.width }
    : { width: meta.width, height: meta.height };
}

// Returns null when the file matches its spec, otherwise the sentence shown to the admin.
export function checkImage(
  purpose: UploadPurpose,
  meta: ImageMeta,
): string | null {
  const spec = IMAGE_SPECS[purpose];
  if (!isAllowedFormat(meta)) {
    return "Images must be JPEG, PNG, WebP or AVIF";
  }
  if (meta.bytes <= 0 || meta.bytes > spec.max_bytes) {
    return "Images must be under 8 MB";
  }
  if (!meta.width || !meta.height) {
    return "That file does not read as an image";
  }
  if (spec.ratio === null) {
    const shortest = Math.min(meta.width, meta.height);
    return shortest < spec.min_width
      ? `Review photos need at least ${spec.min_width} px on the shortest side, this one has ${shortest}`
      : null;
  }
  if (meta.width < spec.min_width || meta.height < spec.min_height) {
    return `A ${purpose.toLowerCase()} image needs at least ${spec.min_width} × ${spec.min_height} px, this one is ${meta.width} × ${meta.height}`;
  }
  const ratio = meta.width / meta.height;
  if (Math.abs(ratio - spec.ratio) / spec.ratio > RATIO_TOLERANCE) {
    return `A ${purpose.toLowerCase()} image must be ${spec.ratio_label}, this one is ${meta.width} × ${meta.height}`;
  }
  return null;
}
