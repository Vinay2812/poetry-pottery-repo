"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type ProductSort,
  useProductsQuery,
} from "@/graphql/generated/graphql";

import {
  CategoryStrip,
  type CategoryStripItem,
} from "@/features/products/components/CategoryStrip";
import { EmptyResults } from "@/features/products/components/EmptyResults";
import { FilterSheet } from "@/features/products/components/FilterSheet";
import { LoadFailed } from "@/features/products/components/LoadFailed";
import { LoadMore } from "@/features/products/components/LoadMore";
import { ProductCardSkeleton } from "@/features/products/components/ProductCardSkeleton";
import { ProductFilters } from "@/features/products/components/ProductFilters";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductToolbar } from "@/features/products/components/ProductToolbar";
import { SearchField } from "@/features/products/components/SearchField";
import { ProductCardContainer } from "@/features/products/containers/ProductCardContainer";
import {
  countActiveFilters,
  EMPTY_FILTERS,
  parseFilters,
  type ProductFilters as Filters,
  toFilterInput,
  toSearchParams,
} from "@/features/products/types";

export interface ProductListContainerProps {
  categories: { slug: string; name: string; imageUrl: string | null }[];
  heading: string;
  description: string | null;
  isSearchPage?: boolean;
}

const SEARCH_DEBOUNCE_MS = 300;

export function ProductListContainer({
  categories,
  heading,
  description,
  isSearchPage = false,
}: ProductListContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [priceDraft, setPriceDraft] = useState<[number, number] | null>(null);
  const [searchDraft, setSearchDraft] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, previousData, loading, error, fetchMore, refetch } =
    useProductsQuery({
      variables: { filter: toFilterInput(filters, 1) },
      notifyOnNetworkStatusChange: true,
    });
  const result = data?.products ?? previousData?.products;
  const items = result?.items ?? [];
  const pageInfo = result?.page_info;
  const facets = result?.facets;
  const isInitialLoading = loading && !result;
  const isFetchingMore = loading && Boolean(result);

  const applyFilters = useCallback(
    (next: Filters) => {
      const query = toSearchParams(next).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  // Typing updates the field at once and the URL after a short pause.
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchDraft(value);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        applyFilters({ ...filters, search: value.trim() });
      }, SEARCH_DEBOUNCE_MS);
    },
    [applyFilters, filters],
  );
  const handleSearchClear = useCallback(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setSearchDraft("");
    applyFilters({ ...filters, search: "" });
  }, [applyFilters, filters]);
  // The draft stays on screen until the URL has caught up, so the field never snaps back mid-navigation.
  const searchValue =
    searchDraft !== null && searchDraft.trim() !== filters.search
      ? searchDraft
      : filters.search;
  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    },
    [],
  );

  const handleSortChange = useCallback(
    (sort: ProductSort) => applyFilters({ ...filters, sort }),
    [applyFilters, filters],
  );
  const handleToggleCategory = useCallback(
    (slug: string) =>
      applyFilters({
        ...filters,
        categories: filters.categories.includes(slug)
          ? filters.categories.filter((value) => value !== slug)
          : [...filters.categories, slug],
      }),
    [applyFilters, filters],
  );
  const handleToggleMaterial = useCallback(
    (material: string) =>
      applyFilters({
        ...filters,
        materials: filters.materials.includes(material)
          ? filters.materials.filter((value) => value !== material)
          : [...filters.materials, material],
      }),
    [applyFilters, filters],
  );
  const handlePriceCommit = useCallback(
    (range: [number, number]) => {
      setPriceDraft(null);
      const isFullRange = facets
        ? range[0] <= facets.price_min && range[1] >= facets.price_max
        : false;
      applyFilters({
        ...filters,
        minPrice: isFullRange ? null : range[0],
        maxPrice: isFullRange ? null : range[1],
      });
    },
    [applyFilters, facets, filters],
  );
  const handleInStockChange = useCallback(
    (value: boolean) => applyFilters({ ...filters, inStockOnly: value }),
    [applyFilters, filters],
  );
  const handleCustomizableChange = useCallback(
    (value: boolean) => applyFilters({ ...filters, customizableOnly: value }),
    [applyFilters, filters],
  );
  const handleClear = useCallback(
    () => applyFilters({ ...EMPTY_FILTERS, collection: filters.collection }),
    [applyFilters, filters.collection],
  );

  const handleLoadMore = useCallback(() => {
    if (!pageInfo?.has_more || loading) return;
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
    });
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
  const priceRange: [number, number] = priceDraft ?? [
    filters.minPrice ?? priceFloor,
    filters.maxPrice ?? priceCeiling,
  ];
  const activeFilterCount = countActiveFilters(filters);
  const categoryItems: CategoryStripItem[] = categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    imageUrl: category.imageUrl,
    href: `${pathname}?${toSearchParams({ ...filters, categories: [category.slug] }).toString()}`,
    isActive:
      filters.categories.length === 1 &&
      filters.categories[0] === category.slug,
  }));

  const filterPanel = facets && (
    <ProductFilters
      categoryOptions={facets.categories}
      selectedCategories={filters.categories}
      materialOptions={facets.materials}
      selectedMaterials={filters.materials}
      priceFloor={priceFloor}
      priceCeiling={priceCeiling}
      priceRange={priceRange}
      inStockOnly={filters.inStockOnly}
      customizableOnly={filters.customizableOnly}
      hasActiveFilters={activeFilterCount > 0}
      onToggleCategory={handleToggleCategory}
      onToggleMaterial={handleToggleMaterial}
      onPriceRangeChange={setPriceDraft}
      onPriceRangeCommit={handlePriceCommit}
      onInStockOnlyChange={handleInStockChange}
      onCustomizableOnlyChange={handleCustomizableChange}
      onClear={handleClear}
    />
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl md:text-5xl">{heading}</h1>
        {description && (
          <p className="max-w-2xl text-muted-foreground">{description}</p>
        )}
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

      <CategoryStrip
        items={categoryItems}
        allHref={`${pathname}?${toSearchParams({ ...filters, categories: [] }).toString()}`}
        isAllActive={filters.categories.length === 0}
      />

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{filterPanel}</div>
        </aside>

        <div className="flex flex-col gap-5">
          <ProductToolbar
            total={pageInfo?.total ?? 0}
            isLoading={isInitialLoading}
            sort={filters.sort}
            activeFilterCount={activeFilterCount}
            onSortChange={handleSortChange}
            onOpenFilters={() => setIsSheetOpen(true)}
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
            <>
              <ProductGrid>
                {items.map((product, index) => (
                  <ProductCardContainer
                    key={product.id}
                    product={product}
                    isPriority={index < 4}
                  />
                ))}
              </ProductGrid>
              {pageInfo && (
                <LoadMore
                  hasMore={pageInfo.has_more}
                  isLoading={isFetchingMore}
                  loadedCount={items.length}
                  total={pageInfo.total}
                  onLoadMore={handleLoadMore}
                  sentinelRef={sentinelRef}
                />
              )}
            </>
          )}
        </div>
      </div>

      <FilterSheet
        isOpen={isSheetOpen}
        resultCount={pageInfo?.total ?? 0}
        onOpenChange={setIsSheetOpen}
      >
        {filterPanel}
      </FilterSheet>
    </div>
  );
}
