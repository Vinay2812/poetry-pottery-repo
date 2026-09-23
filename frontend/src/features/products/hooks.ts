"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMutation } from "@apollo/client/react";
import { CreateCustomizationUploadDocument } from "@/graphql/generated/graphql";

import {
  MAX_REFERENCE_PHOTOS,
  type ReferencePhoto,
  remainingReferenceSlots,
  validateReferencePhoto,
} from "@/features/products/types";

const TOO_MANY = `You can attach up to ${MAX_REFERENCE_PHOTOS} photos`;
const UPLOAD_FAILED = "Upload failed";

// Fetch has no upload progress, so the presigned PUT goes through XHR.
function putWithProgress(
  url: string,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error(UPLOAD_FAILED));
    });
    request.addEventListener("error", () => reject(new Error(UPLOAD_FAILED)));
    request.addEventListener("abort", () => reject(new Error(UPLOAD_FAILED)));
    request.send(file);
  });
}

export function useReferencePhotos() {
  const [photos, setPhotos] = useState<ReferencePhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createUpload] = useMutation(CreateCustomizationUploadDocument);
  const previewUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  const patch = useCallback((id: string, change: Partial<ReferencePhoto>) => {
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === id ? { ...photo, ...change } : photo,
      ),
    );
  }, []);

  const upload = useCallback(
    async (id: string, file: File) => {
      try {
        const result = await createUpload({
          variables: { content_type: file.type, size: file.size },
        });
        const ticket = result.data?.createCustomizationUpload;
        if (!ticket) throw new Error(UPLOAD_FAILED);
        await putWithProgress(ticket.upload_url, file, (percent) =>
          patch(id, { progress: percent }),
        );
        patch(id, { progress: 100, url: ticket.public_url });
      } catch {
        patch(id, { error: UPLOAD_FAILED });
      }
    },
    [createUpload, patch],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const slots = remainingReferenceSlots(photos.length);
      if (slots === 0) {
        setError(TOO_MANY);
        return;
      }
      let message = files.length > slots ? TOO_MANY : null;
      const accepted: { photo: ReferencePhoto; file: File }[] = [];
      for (const file of files.slice(0, slots)) {
        const issue = validateReferencePhoto(file);
        if (issue !== null) {
          message = issue;
          continue;
        }
        const previewUrl = URL.createObjectURL(file);
        previewUrls.current.add(previewUrl);
        accepted.push({
          photo: {
            id: crypto.randomUUID(),
            name: file.name,
            previewUrl,
            progress: 0,
            url: null,
            error: null,
          },
          file,
        });
      }
      setError(message);
      if (accepted.length === 0) return;
      setPhotos((current) => [
        ...current,
        ...accepted.map((entry) => entry.photo),
      ]);
      for (const entry of accepted) void upload(entry.photo.id, entry.file);
    },
    [photos.length, upload],
  );

  const removePhoto = useCallback((id: string) => {
    setError(null);
    setPhotos((current) => {
      const photo = current.find((candidate) => candidate.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
        previewUrls.current.delete(photo.previewUrl);
      }
      return current.filter((candidate) => candidate.id !== id);
    });
  }, []);

  const clearPhotos = useCallback(() => {
    setError(null);
    setPhotos((current) => {
      for (const photo of current) {
        URL.revokeObjectURL(photo.previewUrl);
        previewUrls.current.delete(photo.previewUrl);
      }
      return [];
    });
  }, []);

  return { photos, error, setError, addFiles, removePhoto, clearPhotos };
}
