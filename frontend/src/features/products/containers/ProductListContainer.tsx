"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

import { useQuery } from "@apollo/client/react";
import {
  ProductsDocument,
  type ProductSort,
  type ProductsQuery,
} from "@/graphql/generated/graphql";

import { cn } from "@/lib/utils";

import { PageShell } from "@/components/layout/PageShell";

import { ARCHIVE_PATH } from "@/features/archive/types";

import { EmptyResults } from "@/features/products/components/EmptyResults";
import { FilterSheet } from "@/features/products/components/FilterSheet";
import { LoadFailed } from "@/features/products/components/LoadFailed";
import { LoadMore } from "@/features/products/components/LoadMore";
import { ProductCardSkeleton } from "@/features/products/components/ProductCardSkeleton";
import { ProductFilters } from "@/features/products/components/ProductFilters";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductToolbar } from "@/features/products/components/ProductToolbar";
import { SearchField } from "@/features/products/components/SearchField";
import { ShelfTabs } from "@/features/products/components/ShelfTabs";
import { ProductCardContainer } from "@/features/products/containers/ProductCardContainer";
import {
  applyFilterAction,
  clampPriceRange,
  countActiveFilters,
  type FilterAction,
  parseFilters,
  type ProductFilters as Filters,
  toCardPhotoLoading,
  toFilterInput,
  toFilterKey,
  toSearchParams,
} from "@/features/products/types";

export interface ProductListContainerProps {
  heading: string;
  description: string | null;
  isSearchPage?: boolean;
  initialProducts?: ProductsQuery["products"] | null;
  initialFilterKey?: string | null;
}

const SEARCH_DEBOUNCE_MS = 300;

export function ProductListContainer({
  heading,
  description,
  isSearchPage = false,
  initialProducts = null,
  initialFilterKey = null,
}: ProductListContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The URL stays the source of truth; the optimistic layer only covers the navigation.
  const urlFilters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [filters, addOptimisticFilter] = useOptimistic(
    urlFilters,
    applyFilterAction,
  );
  const [isPending, startTransition] = useTransition();
  // Rapid clicks stack on each other; the URL takes over again once the navigations settle.
  const pendingRef = useRef(urlFilters);
  useEffect(() => {
    if (!isPending) pendingRef.current = urlFilters;
  }, [isPending, urlFilters]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [priceDraft, setPriceDraft] = useState<[number, number] | null>(null);
  const [searchDraft, setSearchDraft] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filterInput = toFilterInput(filters, 1);
  const { data, previousData, loading, error, fetchMore, refetch } = useQuery(
    ProductsDocument,
    {
      variables: { filter: filterInput },
      notifyOnNetworkStatusChange: true,
    },
  );
  // The server's first page covers the first load, but only while the filters still match it.
  const serverPage =
    initialProducts && initialFilterKey === toFilterKey(filterInput)
      ? initialProducts
      : undefined;
  // Old results bridge a load, not a failure: they would sit under filters they do not match.
  const result =
    data?.products ??
    (error ? undefined : (previousData?.products ?? serverPage));
  const items = result?.items ?? [];
  const pageInfo = result?.page_info;
  const facets = result?.facets;
  const isInitialLoading = loading && !result;

  const toHref = useCallback(
    (next: Filters) => {
      const query = toSearchParams(next).toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname],
  );

  const dispatch = useCallback(
    (action: FilterAction) => {
      const next = applyFilterAction(pendingRef.current, action);
      pendingRef.current = next;
      startTransition(() => {
        addOptimisticFilter(action);
        router.replace(toHref(next), { scroll: false });
      });
    },
    [addOptimisticFilter, router, toHref],
  );

  // Typing updates the field at once and the URL after a short pause.
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchDraft(value);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        dispatch({ type: "search", value });
      }, SEARCH_DEBOUNCE_MS);
    },
    [dispatch],
  );
  const handleSearchClear = useCallback(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setSearchDraft("");
    dispatch({ type: "search", value: "" });
  }, [dispatch]);
  // The draft stays on screen until the URL has caught up, so the field never snaps back mid-navigation.
  const searchValue =
    searchDraft !== null && searchDraft.trim() !== filters.search
      ? searchDraft
      : filters.search;
  // The field paints on every keystroke; the results follow this copy at a lower priority.
  const deferredSearchValue = useDeferredValue(searchValue);
  const isSearchSettling = deferredSearchValue.trim() !== filters.search;
  // Results stay on screen while a new page loads; only their opacity says so.
  const isBusy =
    isPending ||
    isSearchSettling ||
    (loading && Boolean(result) && !isAppending);
  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    },
    [],
  );

  const handleSortChange = useCallback(
    (sort: ProductSort) => dispatch({ type: "sort", sort }),
    [dispatch],
  );
  const handleToggleCategory = useCallback(
    (slug: string) => dispatch({ type: "category", slug }),
    [dispatch],
  );
  const handleToggleCollection = useCallback(
    (slug: string) => dispatch({ type: "collection", slug }),
    [dispatch],
  );
  const handleToggleMaterial = useCallback(
    (material: string) => dispatch({ type: "material", material }),
    [dispatch],
  );
  const handleToggleGlaze = useCallback(
    (slug: string) => dispatch({ type: "glaze", slug }),
    [dispatch],
  );
  // The archive tab is a real link to its own gallery, so only the shelf tab is intercepted.
  const handleSelectShelf = useCallback(
    () => dispatch({ type: "view", isArchive: false }),
    [dispatch],
  );
  const handlePriceCommit = useCallback(
    (range: [number, number]) => {
      setPriceDraft(null);
      const isFullRange = facets
        ? range[0] <= facets.price_min && range[1] >= facets.price_max
        : false;
      dispatch({
        type: "price",
        min: isFullRange ? null : range[0],
        max: isFullRange ? null : range[1],
      });
    },
    [dispatch, facets],
  );
  const handleInStockChange = useCallback(
    (value: boolean) => dispatch({ type: "inStock", value }),
    [dispatch],
  );
  const handleCustomizableChange = useCallback(
    (value: boolean) => dispatch({ type: "customizable", value }),
    [dispatch],
  );
  const handleSecondsChange = useCallback(
    (value: boolean) => dispatch({ type: "seconds", value }),
    [dispatch],
  );
  const handleClear = useCallback(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setSearchDraft(null);
    setPriceDraft(null);
    dispatch({ type: "clear" });
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!pageInfo?.has_more || loading) return;
    setIsAppending(true);
    void fetchMore({
      variables: { filter: toFilterInput(filters, pageInfo.page + 1) },
      updateQuery: (previous, { fetchMoreResult }) => ({
        products: {
          ...fetchMoreResult.products,
          items: [
            ...previous.products.items,
            ...fetchMoreResult.products.items,
          ],
        },
      }),
    }).finally(() => setIsAppending(false));
  }, [fetchMore, filters, loading, pageInfo]);

  // Load the next page when the sentinel scrolls into view.
  const loadMoreRef = useRef(handleLoadMore);
  useEffect(() => {
    loadMoreRef.current = handleLoadMore;
  }, [handleLoadMore]);
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting))
          loadMoreRef.current();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const priceFloor = facets?.price_min ?? 0;
  const priceCeiling = facets?.price_max ?? 0;
  const priceRange = clampPriceRange(
    priceDraft ?? [
      filters.minPrice ?? priceFloor,
      filters.maxPrice ?? priceCeiling,
    ],
    priceFloor,
    priceCeiling,
  );
  const activeFilterCount = countActiveFilters(filters);

  const filterPanel = facets && (
    <ProductFilters
      categoryOptions={facets.categories}
      selectedCategories={filters.categories}
      collectionOptions={facets.collections}
      selectedCollection={filters.collection}
      materialOptions={facets.materials}
      selectedMaterials={filters.materials}
      glazeOptions={facets.glazes}
      selectedGlazes={filters.glazes}
      priceFloor={priceFloor}
      priceCeiling={priceCeiling}
      priceRange={priceRange}
      inStockOnly={filters.inStockOnly}
      customizableOnly={filters.customizableOnly}
      secondsOnly={filters.secondsOnly}
      secondsCount={facets.seconds_count}
      onToggleCategory={handleToggleCategory}
      onToggleCollection={handleToggleCollection}
      onToggleMaterial={handleToggleMaterial}
      onToggleGlaze={handleToggleGlaze}
      onPriceRangeChange={setPriceDraft}
      onPriceRangeCommit={handlePriceCommit}
      onInStockOnlyChange={handleInStockChange}
      onCustomizableOnlyChange={handleCustomizableChange}
      onSecondsOnlyChange={handleSecondsChange}
    />
  );

  return (
    <PageShell className="flex flex-col gap-6 py-8 md:py-12">
      {/* The description line is always in the layout, so a collection without one
          does not lift the tabs and the grid under it. */}
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl md:text-5xl">{heading}</h1>
        <p className="min-h-6 max-w-2xl text-muted-foreground">{description}</p>
      </header>

      {(isSearchPage || filters.search) && (
        <div className="max-w-xl">
          <SearchField
            value={searchValue}
            placeholder="Try “tea cup”, “sage green” or “planter”"
            onChange={handleSearchChange}
            onClear={handleSearchClear}
            autoFocus={isSearchPage}
          />
        </div>
      )}

      {!isSearchPage && (
        <ShelfTabs
          shelfHref={toHref({ ...filters, isArchive: false })}
          archiveHref={ARCHIVE_PATH}
          shelfCount={facets?.active_count ?? 0}
          archiveCount={facets?.archive_count ?? 0}
          isArchive={filters.isArchive}
          onSelectShelf={handleSelectShelf}
        />
      )}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{filterPanel}</div>
        </aside>

        {/* A narrow result set must not pull the footer up over the reader's scroll position. */}
        <div className="flex min-h-[60vh] flex-col gap-5">
          <ProductToolbar
            total={pageInfo?.total ?? 0}
            isLoading={isInitialLoading}
            sort={filters.sort}
            activeFilterCount={activeFilterCount}
            onSortChange={handleSortChange}
            onOpenFilters={() => setIsSheetOpen(true)}
            onClear={handleClear}
          />

          {isInitialLoading ? (
            <ProductGrid>
              {Array.from({ length: 8 }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </ProductGrid>
          ) : error && !result ? (
            <LoadFailed onRetry={() => void refetch()} />
          ) : items.length === 0 ? (
            <EmptyResults
              search={filters.search}
              hasActiveFilters={activeFilterCount > 0}
              onClear={handleClear}
            />
          ) : (
            <div
              aria-busy={isBusy}
              className={cn(
                "flex flex-col gap-5 transition-opacity duration-200",
                isBusy && "opacity-60",
              )}
            >
              <ProductGrid>
                {items.map((product, index) => (
                  <ProductCardContainer
                    key={product.id}
                    product={product}
                    isPriority={toCardPhotoLoading(index).isPriority}
                    isEager={toCardPhotoLoading(index).isEager}
                  />
                ))}
              </ProductGrid>
              {pageInfo && (
                <LoadMore
                  hasMore={pageInfo.has_more}
                  isLoading={isAppending}
                  loadedCount={items.length}
                  total={pageInfo.total}
                  onLoadMore={handleLoadMore}
                  sentinelRef={sentinelRef}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <FilterSheet
        isOpen={isSheetOpen}
        resultCount={pageInfo?.total ?? 0}
        activeFilterCount={activeFilterCount}
        onOpenChange={setIsSheetOpen}
        onClear={handleClear}
      >
        {filterPanel}
      </FilterSheet>
    </PageShell>
  );
}
