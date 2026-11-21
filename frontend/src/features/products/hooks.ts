"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { NetworkStatus } from "@apollo/client";
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
  type ShelfPhase,
  toFilterInput,
  toFilterKey,
  toShelfPhase,
  validateReferencePhoto,
} from "@/features/products/types";

type ProductsPage = ProductsQuery["products"];

// Only these statuses mean the first page itself is on its way; a fetchMore or a poll does not.
const FIRST_PAGE_LOADING = new Set<NetworkStatus>([
  NetworkStatus.loading,
  NetworkStatus.setVariables,
  NetworkStatus.refetch,
]);

interface AppendRequest {
  key: string;
  page: number;
  status: "loading" | "failed";
}

export interface ShelfResults {
  // What is on screen: the current answer, or the last one while the next loads.
  result: ProductsPage | undefined;
  phase: ShelfPhase;
  // Old results under new filters: still shown, dimmed until the answer lands.
  isRefreshing: boolean;
  // The browser holds its own first page, so a next page has something to join.
  canLoadMore: boolean;
  isAppending: boolean;
  hasAppendFailed: boolean;
  loadMore: () => void;
  retry: () => void;
}

// The shelf's list. The server's first page bridges the first load and old results bridge a
// filter change. A next page is tracked here, by filter key and page, and only joins the list
// that asked for it.
export function useShelfResults(
  filters: ProductFilters,
  initialProducts: ProductsPage | null,
  initialFilterKey: string | null,
  isFiltersMoving = false,
): ShelfResults {
  const filterInput = toFilterInput(filters, 1);
  const filterKey = toFilterKey(filterInput);
  const [append, setAppend] = useState<AppendRequest | null>(null);
  // Apollo moves to new variables during render, so the key must follow before any page lands.
  const latestKey = useRef(filterKey);
  useLayoutEffect(() => {
    latestKey.current = filterKey;
  }, [filterKey]);

  const {
    data,
    previousData,
    loading,
    error,
    networkStatus,
    fetchMore,
    refetch,
  } = useQuery(ProductsDocument, {
    variables: { filter: filterInput },
    notifyOnNetworkStatusChange: true,
  });
  const serverPage =
    initialProducts && initialFilterKey === filterKey
      ? initialProducts
      : undefined;
  const current = data?.products;
  const isOwnPageLoading = FIRST_PAGE_LOADING.has(networkStatus);
  const phase = toShelfPhase({
    hasFailed: Boolean(error),
    isFiltersMoving,
    hasOwnPage: current !== undefined,
    isOwnPageLoading,
    hasServerPage: serverPage !== undefined,
  });
  // A failure keeps the last answer on hand, so the filter options stay to recover with.
  const result =
    current ??
    serverPage ??
    previousData?.products ??
    (loading ? (initialProducts ?? undefined) : undefined);

  const ownAppend = append?.key === filterKey ? append : null;
  const isAppending = ownAppend?.status === "loading";
  const canLoadMore = current !== undefined && !isOwnPageLoading && !error;

  const loadMore = useCallback(() => {
    if (!current || !canLoadMore || isAppending) return;
    if (!current.page_info.has_more) return;
    const request: AppendRequest = {
      key: filterKey,
      page: current.page_info.page + 1,
      status: "loading",
    };
    const isThisRequest = (other: AppendRequest | null) =>
      other?.key === request.key && other.page === request.page;
    setAppend(request);
    fetchMore({
      variables: { filter: toFilterInput(filters, request.page) },
      // A page that lands after the filters moved on, or with no first page to join, is dropped.
      // Apollo types `previous` as always there, but it can be missing; returning it unchanged writes nothing.
      updateQuery: (previous, { fetchMoreResult }) =>
        !(previous as ProductsQuery | null | undefined)?.products ||
        latestKey.current !== request.key
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
    }).then(
      () => setAppend((other) => (isThisRequest(other) ? null : other)),
      () =>
        setAppend((other) =>
          isThisRequest(other) ? { ...request, status: "failed" } : other,
        ),
    );
  }, [canLoadMore, current, fetchMore, filterKey, filters, isAppending]);

  const retry = useCallback(() => void refetch(), [refetch]);

  return {
    result,
    phase,
    isRefreshing: phase === "pending" && result !== undefined,
    canLoadMore,
    isAppending,
    hasAppendFailed: ownAppend?.status === "failed",
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
