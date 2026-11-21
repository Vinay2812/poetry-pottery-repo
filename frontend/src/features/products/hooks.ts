"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  CreateCustomizationUploadDocument,
  ProductsDocument,
  type ProductsQuery,
} from "@/graphql/generated/graphql";

import {
  MAX_REFERENCE_PHOTOS,
  type ProductFilters,
  type ReferencePhoto,
  remainingReferenceSlots,
  toFilterInput,
  toFilterKey,
  validateReferencePhoto,
} from "@/features/products/types";

type ProductsPage = ProductsQuery["products"];

export interface ShelfResults {
  // What is on screen: the current answer, or the last one while the next loads.
  result: ProductsPage | undefined;
  // The current filters have their own answer, so counts and empty copy may speak.
  isSettled: boolean;
  isRefreshing: boolean;
  isAppending: boolean;
  isFailed: boolean;
  loadMore: () => void;
  retry: () => void;
}

// The shelf's list: the server's first page bridges the first load, old results bridge a
// filter change, and a page only joins the list it was asked for.
export function useShelfResults(
  filters: ProductFilters,
  initialProducts: ProductsPage | null,
  initialFilterKey: string | null,
): ShelfResults {
  const filterInput = toFilterInput(filters, 1);
  const filterKey = toFilterKey(filterInput);
  const [appendingKey, setAppendingKey] = useState<string | null>(null);
  const latestKey = useRef(filterKey);
  useEffect(() => {
    latestKey.current = filterKey;
  }, [filterKey]);

  const { data, previousData, loading, error, fetchMore, refetch } = useQuery(
    ProductsDocument,
    {
      variables: { filter: filterInput },
      notifyOnNetworkStatusChange: true,
    },
  );
  const serverPage =
    initialProducts && initialFilterKey === filterKey
      ? initialProducts
      : undefined;
  const isAppending = appendingKey === filterKey;
  const current = data?.products;
  // Old results bridge a load, not a failure: they would sit under filters they do not match.
  // The server's page stands in until the browser has a page of its own to show.
  const bridge = error
    ? undefined
    : (serverPage ??
      previousData?.products ??
      (loading ? (initialProducts ?? undefined) : undefined));
  const result = current ?? bridge;
  const isSettled =
    !error && (current ? !loading || isAppending : serverPage !== undefined);
  const pageInfo = result?.page_info;

  const loadMore = useCallback(() => {
    if (!isSettled || isAppending || !pageInfo?.has_more) return;
    const startedKey = filterKey;
    setAppendingKey(startedKey);
    void fetchMore({
      variables: { filter: toFilterInput(filters, pageInfo.page + 1) },
      // A page that lands after the filters moved on belongs to another list, so it is dropped.
      updateQuery: (previous, { fetchMoreResult }) =>
        latestKey.current !== startedKey
          ? previous
          : {
              products: {
                ...fetchMoreResult.products,
                items: [
                  ...previous.products.items,
                  ...fetchMoreResult.products.items,
                ],
              },
            },
    }).finally(() =>
      setAppendingKey((key) => (key === startedKey ? null : key)),
    );
  }, [fetchMore, filterKey, filters, isAppending, isSettled, pageInfo]);

  const retry = useCallback(() => void refetch(), [refetch]);

  return {
    result,
    isSettled,
    isRefreshing: loading && Boolean(result) && !isAppending,
    isAppending,
    isFailed: Boolean(error) && !result,
    loadMore,
    retry,
  };
}

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
