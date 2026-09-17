"use client";

import { useCallback, useMemo } from "react";

import {
  type UploadPurpose,
  useConfirmUploadMutation,
  useCreateAdminUploadMutation,
  useImageSpecsQuery,
} from "@/graphql/generated/graphql";

import { centreCrop, type ImageRequirement } from "./types";

export function useImageRequirement(
  purpose: UploadPurpose,
): ImageRequirement | null {
  const { data } = useImageSpecsQuery({ fetchPolicy: "cache-first" });
  return useMemo(() => {
    const spec = data?.imageSpecs.find((item) => item.purpose === purpose);
    if (!spec) return null;
    return {
      purpose: spec.purpose,
      ratio: spec.ratio ?? null,
      ratioLabel: spec.ratio_label,
      minWidth: spec.min_width,
      minHeight: spec.min_height,
      maxBytes: spec.max_bytes,
      contentTypes: spec.content_types,
      rendersAt: spec.renders_at,
    };
  }, [data, purpose]);
}

export interface MeasuredFile {
  blob: Blob;
  width: number;
  height: number;
}

export async function measureFile(file: File): Promise<MeasuredFile> {
  const bitmap = await createImageBitmap(file);
  const measured = { blob: file, width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return measured;
}

/** Draws the largest centred rectangle of the wanted ratio onto a canvas. */
export async function cropToRatio(
  file: File,
  ratio: number,
): Promise<MeasuredFile> {
  const bitmap = await createImageBitmap(file);
  const rect = centreCrop(bitmap.width, bitmap.height, ratio);
  const canvas = document.createElement("canvas");
  canvas.width = rect.width;
  canvas.height = rect.height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("This browser cannot crop images");
  }
  context.drawImage(
    bitmap,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    rect.width,
    rect.height,
  );
  bitmap.close();
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.92),
  );
  if (!blob) throw new Error("This browser could not write the crop");
  return { blob, width: rect.width, height: rect.height };
}

export const UPLOAD_NOT_STORED = "The image did not reach storage";

/** A rejected PUT reads as "Failed to fetch"; all the operator needs is that it did not land. */
export async function putToStorage(
  uploadUrl: string,
  blob: Blob,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "content-type": contentType },
  }).catch(() => null);
  if (!response?.ok) throw new Error(UPLOAD_NOT_STORED);
}

export function useConfirmedUpload() {
  const [createUpload] = useCreateAdminUploadMutation();
  const [confirmUpload] = useConfirmUploadMutation();

  return useCallback(
    async (purpose: UploadPurpose, blob: Blob): Promise<string> => {
      const contentType = blob.type || "image/jpeg";
      const created = await createUpload({
        variables: { purpose, content_type: contentType, size: blob.size },
      });
      const target = created.data?.createAdminUpload;
      if (!target) throw new Error("The upload could not be started");

      await putToStorage(target.upload_url, blob, contentType);

      const confirmed = await confirmUpload({
        variables: { key: target.key, purpose },
      });
      const url = confirmed.data?.confirmUpload.public_url;
      if (!url) throw new Error("The image was not confirmed");
      return url;
    },
    [confirmUpload, createUpload],
  );
}
