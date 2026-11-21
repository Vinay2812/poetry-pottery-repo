import type { UploadPurpose } from "@/graphql/generated/graphql";

export interface ImageRequirement {
  purpose: UploadPurpose;
  ratio: number | null;
  ratioLabel: string;
  maxBytes: number;
  contentTypes: string[];
  rendersAt: string;
}

/** The API allows the stored file to miss the ratio by this much before it deletes it. */
const RATIO_TOLERANCE = 0.02;

export function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${Math.round(mb)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/** The one line shown above the file input, before anything is picked. */
export function describeRequirement(
  ratioLabel: string,
  maxBytes: number,
): string {
  const shape = ratioLabel === "any" ? "Any shape" : `${ratioLabel}`;
  return `${shape} · up to ${formatBytes(maxBytes)}`;
}

export function describeFileType(contentTypes: readonly string[]): string {
  const names = contentTypes.map((type) =>
    type.replace("image/", "").toUpperCase(),
  );
  return names.join(", ");
}

export type FileProblem = string | null;

export function checkFile(
  contentTypes: readonly string[],
  maxBytes: number,
  type: string,
  size: number,
): FileProblem {
  if (!contentTypes.includes(type)) {
    return `That file is ${type || "an unknown type"}. Use ${describeFileType(contentTypes)}.`;
  }
  if (size <= 0 || size > maxBytes) {
    return `That file is ${formatBytes(size)}. The limit is ${formatBytes(maxBytes)}.`;
  }
  return null;
}

export type DimensionVerdict =
  { kind: "ok" } | { kind: "wrong-ratio"; message: string };

// Only the shape is checked; next/image scales whatever size arrives.
export function checkDimensions(
  ratio: number | null,
  ratioLabel: string,
  width: number,
  height: number,
): DimensionVerdict {
  if (
    ratio !== null &&
    Math.abs(width / height - ratio) > ratio * RATIO_TOLERANCE
  ) {
    return {
      kind: "wrong-ratio",
      message: `That image is ${width} × ${height}, which is not ${ratioLabel}.`,
    };
  }
  return { kind: "ok" };
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The largest centred rectangle of the wanted ratio that fits inside the picture. */
export function centreCrop(
  width: number,
  height: number,
  ratio: number,
): CropRect {
  const isTooWide = width / height > ratio;
  const cropWidth = isTooWide ? Math.round(height * ratio) : width;
  const cropHeight = isTooWide ? height : Math.round(width / ratio);
  return {
    x: Math.round((width - cropWidth) / 2),
    y: Math.round((height - cropHeight) / 2),
    width: cropWidth,
    height: cropHeight,
  };
}

export function moveUrl(
  urls: readonly string[],
  from: number,
  to: number,
): string[] {
  if (to < 0 || to >= urls.length || from < 0 || from >= urls.length) {
    return [...urls];
  }
  const next = [...urls];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
