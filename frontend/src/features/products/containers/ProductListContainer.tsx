"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ProductSort, ProductsQuery } from "@/graphql/generated/graphql";

import { useUrlState } from "@/lib/use-url-state";
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
import { useSearchDraft, useShelfResults } from "@/features/products/hooks";
import {
  clampPriceRange,
  countActiveFilters,
  isShelfCountable,
  PRODUCT_FILTERS_CODEC,
  toCardPhotoLoading,
  toPriceRangeLabel,
  toResultCountLabel,
  toShelfCountLine,
  toShelfTabCount,
  toShowPiecesLabel,
} from "@/features/products/types";

export interface ProductListContainerProps {
  heading: string;
  description: string | null;
  isSearchPage?: boolean;
  initialProducts?: ProductsQuery["products"] | null;
  initialFilterKey?: string | null;
}

export function ProductListContainer({
  heading,
  description,
  isSearchPage = false,
  initialProducts = null,
  initialFilterKey = null,
}: ProductListContainerProps) {
  const {
    value: filters,
    isPending,
    dispatch,
    toHref,
  } = useUrlState(PRODUCT_FILTERS_CODEC);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [priceDraft, setPriceDraft] = useState<[number, number] | null>(null);
  // Typing updates the field at once and the URL after a short pause.
  const commitSearch = useCallback(
    (value: string) => dispatch({ type: "search", value }),
    [dispatch],
  );
  const {
    value: searchValue,
    change: handleSearchChange,
    flush: handleSearchBlur,
    clear: handleSearchClear,
    reset: resetSearchDraft,
  } = useSearchDraft(filters.search, commitSearch);
  // The field paints on every keystroke; the results follow this copy at a lower priority.
  const deferredSearchValue = useDeferredValue(searchValue);
  const isSearchSettling = deferredSearchValue.trim() !== filters.search;
  const {
    result,
    phase,
    isRefreshing,
    isNextPageLoading,
    canAskNextPage,
    hasAppendFailed,
    loadMore: handleLoadMore,
    retry: handleRetry,
  } = useShelfResults({
    filters,
    initialProducts,
    initialFilterKey,
    isFiltersMoving: isPending || isSearchSettling,
  });
  const items = result?.items ?? [];
  const pageInfo = result?.page_info;
  const facets = result?.facets;
  const handleOpenFilters = useCallback(() => setIsSheetOpen(true), []);
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
  const handleClearPrice = useCallback(() => {
    setPriceDraft(null);
    dispatch({ type: "price", min: null, max: null });
  }, [dispatch]);
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
  // The empty state's button goes away once the search clears, so focus moves to the field.
  const searchInputRef = useRef<HTMLInputElement>(null);
  const handleClearSearchFromEmpty = useCallback(() => {
    handleSearchClear();
    searchInputRef.current?.focus();
  }, [handleSearchClear]);
  const handleClear = useCallback(() => {
    resetSearchDraft();
    setPriceDraft(null);
    dispatch({ type: "clear" });
  }, [dispatch, resetSearchDraft]);

  // Load the next page when the sentinel scrolls into view.
  const loadMoreRef = useRef(handleLoadMore);
  useEffect(() => {
    loadMoreRef.current = handleLoadMore;
  }, [handleLoadMore]);
  // Observed afresh each time a next page becomes askable, so a shopper already at the
  // bottom still sets it off: the observer reports the current position when it starts.
  // After a failure only "Try again" asks; re-arming then would retry in a tight loop.
  const isSentinelArmed = canAskNextPage && !hasAppendFailed;
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !isSentinelArmed) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting))
            loadMoreRef.current();
        },
        { rootMargin: "600px 0px" },
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [isSentinelArmed],
  );

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
  const isMadeToOrderOnly = filters.customizableOnly && activeFilterCount === 1;

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
      chosenPriceLabel={toPriceRangeLabel(filters.minPrice, filters.maxPrice)}
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
      onClearPrice={handleClearPrice}
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
            onBlur={handleSearchBlur}
            inputRef={searchInputRef}
            autoFocus={isSearchPage}
          />
        </div>
      )}

      {!isSearchPage && (
        <ShelfTabs
          shelfHref={toHref({ ...filters, isArchive: false })}
          archiveHref={ARCHIVE_PATH}
          shelfCount={toShelfTabCount(phase, facets?.active_count)}
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
            countLine={toShelfCountLine(
              phase,
              toResultCountLabel(
                pageInfo?.total ?? 0,
                filters.search,
                filters.customizableOnly,
              ),
            )}
            sort={filters.sort}
            isRelevanceOnly={filters.search !== ""}
            activeFilterCount={activeFilterCount}
            onSortChange={handleSortChange}
            onOpenFilters={handleOpenFilters}
            onClear={handleClear}
          />

          {/* The empty copy speaks only for an answer to the current filters; until then, skeletons. */}
          {phase === "failed" ? (
            <LoadFailed onRetry={handleRetry} />
          ) : items.length === 0 && phase === "pending" ? (
            <ProductGrid>
              {Array.from({ length: 8 }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </ProductGrid>
          ) : items.length === 0 ? (
            <EmptyResults
              search={filters.search}
              hasActiveFilters={activeFilterCount > 0}
              isMadeToOrderOnly={isMadeToOrderOnly}
              onClearSearch={handleClearSearchFromEmpty}
              onClear={handleClear}
            />
          ) : (
            <div
              aria-busy={isRefreshing}
              className={cn(
                "flex flex-col gap-5 transition-opacity duration-200",
                isRefreshing && "opacity-60",
              )}
            >
              <ProductGrid>
                {items.map((product, index) => {
                  const photoLoading = toCardPhotoLoading(index);
                  return (
                    <ProductCardContainer
                      key={product.id}
                      product={product}
                      isPriority={photoLoading.isPriority}
                      isEager={photoLoading.isEager}
                    />
                  );
                })}
              </ProductGrid>
              {/* The footer counts only a settled list; a pending one has no honest number yet. */}
              {pageInfo && isShelfCountable(phase) && (
                <LoadMore
                  hasMore={pageInfo.has_more}
                  isLoading={isNextPageLoading}
                  canAsk={canAskNextPage}
                  hasFailed={hasAppendFailed}
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
        showLabel={toShowPiecesLabel(phase, pageInfo?.total ?? 0)}
        activeFilterCount={activeFilterCount}
        onOpenChange={setIsSheetOpen}
        onClear={handleClear}
      >
        {filterPanel}
      </FilterSheet>
    </PageShell>
  );
}
