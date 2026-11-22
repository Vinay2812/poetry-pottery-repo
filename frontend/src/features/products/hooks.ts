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
  appendShelfPage,
  MAX_REFERENCE_PHOTOS,
  type ProductFilters,
  type ReferencePhoto,
  remainingReferenceSlots,
  settleAppend,
  type ShelfAppend,
  type ShelfPhase,
  toFilterInput,
  toFilterKey,
  toShelfPhase,
  toShelfResult,
  validateReferencePhoto,
} from "@/features/products/types";

type ProductsPage = ProductsQuery["products"];

// Only these statuses mean the first page itself is on its way; a fetchMore or a poll does not.
const FIRST_PAGE_LOADING = new Set<NetworkStatus>([
  NetworkStatus.loading,
  NetworkStatus.setVariables,
  NetworkStatus.refetch,
]);

export interface ShelfResultsOptions {
  filters: ProductFilters;
  initialProducts: ProductsPage | null;
  initialFilterKey: string | null;
  // The filters on screen are ahead of the list: a URL change or a search still being typed.
  isFiltersMoving?: boolean;
}

export interface ShelfResults {
  // What is on screen: the current answer, or the last one while the next loads.
  result: ProductsPage | undefined;
  phase: ShelfPhase;
  // Old results under new filters: still shown, dimmed until the answer lands.
  isRefreshing: boolean;
  // A next page is on its way: the button says so.
  isNextPageLoading: boolean;
  // The browser holds a settled first page and nothing is on its way, so a next page may be asked.
  canAskNextPage: boolean;
  hasAppendFailed: boolean;
  loadMore: () => void;
  retry: () => void;
}

// The shelf's list. The server's first page bridges the first load and old results bridge a
// filter change. Next pages are tracked per filter key and only ever join the list that asked.
export function useShelfResults({
  filters,
  initialProducts,
  initialFilterKey,
  isFiltersMoving = false,
}: ShelfResultsOptions): ShelfResults {
  const filterInput = toFilterInput(filters, 1);
  const filterKey = toFilterKey(filterInput);
  const [appends, setAppends] = useState<Record<string, ShelfAppend>>({});
  // Recorded at once, so a second call in the same frame sees the first before any re-render.
  const inFlight = useRef(new Set<string>());
  // Apollo has already moved to the new variables during render; this key follows at commit,
  // which still comes before any page can land.
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
  const current = data?.products;
  const serverPage =
    initialProducts && initialFilterKey === filterKey
      ? initialProducts
      : undefined;
  const isOwnPageLoading = FIRST_PAGE_LOADING.has(networkStatus);
  const phase = toShelfPhase({
    hasFailed: Boolean(error),
    isFiltersMoving,
    hasOwnPage: current !== undefined,
    isOwnPageLoading,
    hasServerPage: serverPage !== undefined,
  });
  // A failure keeps the last answer on hand, so the filter options stay to recover with.
  const result = toShelfResult({
    current,
    serverPage,
    previous: previousData?.products,
    initial: initialProducts ?? undefined,
    isLoading: loading,
  });

  const ownAppend = appends[filterKey];
  const isNextPageLoading = ownAppend?.status === "loading";
  // Not the same as a ready phase: the server's page counts as ready, but Apollo cannot page from it.
  const hasSettledOwnPage =
    current !== undefined && !isOwnPageLoading && !error;

  const loadMore = useCallback(() => {
    if (!current || !hasSettledOwnPage || !current.page_info.has_more) return;
    const key = filterKey;
    const page = current.page_info.page + 1;
    const requestId = `${key}#${page}`;
    if (inFlight.current.has(requestId)) return;
    inFlight.current.add(requestId);
    const settle = (status: "done" | "failed") =>
      setAppends((all) => settleAppend(all, key, page, status));
    setAppends((all) => ({ ...all, [key]: { page, status: "loading" } }));
    fetchMore({
      variables: { filter: toFilterInput(filters, page) },
      // Only the list that asked takes the page, and only once; anything else writes nothing.
      updateQuery: (previous, { fetchMoreResult }) =>
        latestKey.current === key
          ? (appendShelfPage(previous, fetchMoreResult) ?? previous)
          : previous,
    })
      .then(
        () => settle("done"),
        () => settle("failed"),
      )
      .finally(() => inFlight.current.delete(requestId));
  }, [current, fetchMore, filterKey, filters, hasSettledOwnPage]);

  const retry = useCallback(() => void refetch(), [refetch]);

  return {
    result,
    phase,
    isRefreshing: phase === "pending" && result !== undefined,
    isNextPageLoading,
    canAskNextPage: hasSettledOwnPage && !isNextPageLoading,
    hasAppendFailed: ownAppend?.status === "failed",
    loadMore,
    retry,
  };
}

const SEARCH_DEBOUNCE_MS = 300;

interface SearchDraft {
  // Exactly what was typed, spaces and all; it is trimmed only when sent.
  value: string;
  // The query this draft last put in the URL, or null before its first send.
  sent: string | null;
}

export interface SearchDraftState {
  value: string;
  change: (value: string) => void;
  // Sends a waiting draft now; called when the field loses focus.
  flush: () => void;
  clear: () => void;
  reset: () => void;
}

// The search field's own copy of the query: it paints every keystroke and sends after a pause.
// When the URL's query moves somewhere the draft never sent it (Back, or the header search),
// the draft and its pending send are dropped and the field follows the URL again.
export function useSearchDraft(
  search: string,
  commit: (value: string) => void,
): SearchDraftState {
  const [draft, setDraft] = useState<SearchDraft | null>(null);
  const [seenSearch, setSeenSearch] = useState(search);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waiting = useRef<string | null>(null);

  if (search !== seenSearch) {
    setSeenSearch(search);
    if (draft && draft.sent !== search) setDraft(null);
  }

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    waiting.current = null;
  }, []);
  // A dropped draft takes its pending send with it.
  useEffect(() => {
    if (draft === null) cancel();
  }, [draft, cancel]);
  useEffect(() => cancel, [cancel]);

  const send = useCallback(
    (value: string) => {
      const query = value.trim();
      setDraft((current) => (current ? { ...current, sent: query } : null));
      commit(query);
    },
    [commit],
  );

  const change = useCallback(
    (value: string) => {
      setDraft((current) => ({ value, sent: current?.sent ?? null }));
      cancel();
      waiting.current = value;
      timer.current = setTimeout(() => {
        cancel();
        send(value);
      }, SEARCH_DEBOUNCE_MS);
    },
    [cancel, send],
  );

  // Leaving the field is how most other navigations start: the header search, a link, a
  // suggestion. Sending the draft then puts its replace ahead of that navigation, which
  // therefore lands last and wins; the draft can no longer fire after it. Keyboard Back and
  // iOS swipe-back leave focus where it is; those are covered by dropping the draft once
  // the URL's query moves somewhere it never sent.
  const flush = useCallback(() => {
    const value = waiting.current;
    if (value === null) return;
    cancel();
    send(value);
  }, [cancel, send]);

  const clear = useCallback(() => {
    cancel();
    setDraft({ value: "", sent: "" });
    commit("");
  }, [cancel, commit]);

  const reset = useCallback(() => {
    cancel();
    setDraft(null);
  }, [cancel]);

  return { value: draft?.value ?? search, change, flush, clear, reset };
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
