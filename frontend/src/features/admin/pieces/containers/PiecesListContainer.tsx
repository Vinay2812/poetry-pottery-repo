"use client";

import Link from "next/link";
import { useCallback, useMemo, useOptimistic, useState } from "react";

import { Button } from "@/components/ui/button";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdjustProductStockDocument,
  AdminCategoriesDocument,
  AdminCollectionsDocument,
  AdminGlazesDocument,
  AdminProductsDocument,
  SetProductActiveDocument,
  SetProductFeaturedDocument,
} from "@/graphql/generated/graphql";

import { formatInr } from "@/lib/format";
import { useOptimisticAction } from "@/lib/use-optimistic-action";

import { useAdminQueryState, useSearchDraft } from "@/features/admin/shell";
import {
  AdminConfirmDialog,
  AdminPageHeader,
  AdminPagination,
} from "@/features/admin/ui";

import {
  type PieceRow,
  PiecesTable,
} from "@/features/admin/pieces/components/PiecesTable";
import { PiecesToolbar } from "@/features/admin/pieces/components/PiecesToolbar";
import { StockAdjustDialog } from "@/features/admin/pieces/components/StockAdjustDialog";
import {
  applyStockDelta,
  describeCategories,
  formatStock,
  toProductsFilter,
  canGoLive,
} from "@/features/admin/pieces/types";

// The filter lists every glaze the studio fires; there are never many.
const GLAZE_FILTER_LIMIT = 60;

type RowPatch =
  | { kind: "active"; id: number; isActive: boolean }
  | { kind: "featured"; id: number; isFeatured: boolean }
  | { kind: "stock"; id: number; delta: number };

type ActiveChange = Extract<RowPatch, { kind: "active" }>;
type FeaturedChange = Extract<RowPatch, { kind: "featured" }>;
type StockChange = Extract<RowPatch, { kind: "stock" }> & { reason: string };

function applyRowPatch(rows: PieceRow[], patch: RowPatch): PieceRow[] {
  return rows.map((row) => {
    if (row.id !== patch.id) return row;
    if (patch.kind === "active") return { ...row, isActive: patch.isActive };
    if (patch.kind === "featured")
      return { ...row, isFeatured: patch.isFeatured };
    const stock = applyStockDelta(row.stock, patch.delta);
    return { ...row, stock, stockLabel: formatStock(stock) };
  });
}

export function PiecesListContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const filter = useMemo(() => toProductsFilter(values, page), [values, page]);

  const { data, previousData, loading, refetch } = useQuery(
    AdminProductsDocument,
    {
      variables: { filter },
      fetchPolicy: "cache-and-network",
    },
  );
  const { data: categoryData } = useQuery(AdminCategoriesDocument, {
    fetchPolicy: "cache-first",
  });
  const { data: collectionData } = useQuery(AdminCollectionsDocument, {
    fetchPolicy: "cache-first",
  });
  const { data: glazeData } = useQuery(AdminGlazesDocument, {
    variables: { filter: { page: 1, limit: GLAZE_FILTER_LIMIT } },
    fetchPolicy: "cache-first",
  });

  const [setActive] = useMutation(SetProductActiveDocument);
  const [setFeatured] = useMutation(SetProductFeaturedDocument);
  const [adjustStock] = useMutation(AdjustProductStockDocument);

  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [stockId, setStockId] = useState<number | null>(null);

  const result = data?.adminProducts ?? previousData?.adminProducts;

  const rows = useMemo<PieceRow[]>(
    () =>
      (result?.items ?? []).map((piece) => ({
        id: piece.id,
        name: piece.name,
        imageUrl: piece.image_urls[0] ?? null,
        priceLabel: formatInr(piece.price),
        stock: piece.stock,
        stockLabel: formatStock(piece.stock),
        isActive: piece.is_active,
        canGoLive: canGoLive(piece.stock, piece.is_customizable),
        isFeatured: piece.is_featured,
        categoriesLabel: describeCategories(
          piece.categories.map((category) => category.name),
        ),
        collectionLabel: piece.collection?.name ?? "—",
      })),
    [result],
  );

  const [optimisticRows, patchRow] = useOptimistic(rows, applyRowPatch);

  const categoryOptions = useMemo(
    () =>
      (categoryData?.adminCategories ?? []).map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categoryData],
  );

  const collectionOptions = useMemo(
    () =>
      (collectionData?.adminCollections ?? []).map((collection) => ({
        value: String(collection.id),
        label: collection.name,
      })),
    [collectionData],
  );

  const glazeOptions = useMemo(
    () =>
      (glazeData?.adminGlazes.items ?? []).map((row) => ({
        value: String(row.glaze.id),
        label: row.glaze.name,
      })),
    [glazeData],
  );

  const handleSearchCommit = useCallback(
    (value: string) => patch({ search: value.trim() || null }),
    [patch],
  );
  const [searchDraft, setSearchDraft] = useSearchDraft(
    values.search ?? "",
    handleSearchCommit,
  );

  const { execute: saveFeatured, pending: pendingFeatured } =
    useOptimisticAction({
      patch: (change: FeaturedChange) => patchRow(change),
      run: (change) =>
        setFeatured({
          variables: { id: change.id, is_featured: change.isFeatured },
        }),
      refresh: refetch,
      messages: { success: null, failure: "The piece could not be featured" },
    });

  const runFeatured = useCallback(
    (id: number, isFeatured: boolean) =>
      saveFeatured({ kind: "featured", id, isFeatured }),
    [saveFeatured],
  );

  const { execute: saveActive, pending: pendingActive } = useOptimisticAction({
    patch: (change: ActiveChange) => patchRow(change),
    run: (change) =>
      setActive({ variables: { id: change.id, is_active: change.isActive } }),
    refresh: refetch,
    messages: {
      success: (change) =>
        change.isActive ? "Back on the shelf" : "Moved to the archive",
      failure: "The piece could not be moved",
    },
  });

  const runActive = useCallback(
    (id: number, isActive: boolean) =>
      saveActive({ kind: "active", id, isActive }),
    [saveActive],
  );

  // Hiding a piece takes it off the storefront, so it asks first; showing one does not.
  const handleActiveChange = useCallback(
    (id: number, isActive: boolean) => {
      if (isActive) {
        runActive(id, true);
        return;
      }
      setArchiveId(id);
    },
    [runActive],
  );

  const { execute: saveStock, pending: pendingStock } = useOptimisticAction({
    patch: (change: StockChange) =>
      patchRow({ kind: "stock", id: change.id, delta: change.delta }),
    run: (change) =>
      adjustStock({
        variables: {
          id: change.id,
          delta: change.delta,
          reason: change.reason,
        },
      }),
    refresh: refetch,
    messages: {
      success: "Stock updated",
      failure: "The stock could not be updated",
    },
  });

  const handleStockSubmit = useCallback(
    (delta: number, reason: string) => {
      const id = stockId;
      if (id === null) return;
      setStockId(null);
      saveStock({ kind: "stock", id, delta, reason });
    },
    [saveStock, stockId],
  );

  const busyId =
    pendingFeatured?.id ?? pendingActive?.id ?? pendingStock?.id ?? null;

  const archiveRow = optimisticRows.find((row) => row.id === archiveId);
  const stockRow = optimisticRows.find((row) => row.id === stockId);
  const pageInfo = result?.page_info;
  const isFirstLoad = !result && loading;

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        eyebrow="Studio"
        title="Pieces"
        description="Everything on the shelf, live or archived."
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/pieces/new">New piece</Link>
          </Button>
        }
      />
      <PiecesToolbar
        search={searchDraft}
        categoryId={values.category_id ?? ""}
        collectionId={values.collection_id ?? ""}
        activeState={values.is_active ?? ""}
        featuredState={values.is_featured ?? ""}
        secondState={values.is_second ?? ""}
        glazeId={values.glaze_id ?? ""}
        isLowStockOnly={values.low_stock === "1"}
        categoryOptions={categoryOptions}
        collectionOptions={collectionOptions}
        glazeOptions={glazeOptions}
        onSearchChange={setSearchDraft}
        onCategoryChange={(value) => patch({ category_id: value || null })}
        onCollectionChange={(value) => patch({ collection_id: value || null })}
        onActiveChange={(value) => patch({ is_active: value || null })}
        onFeaturedChange={(value) => patch({ is_featured: value || null })}
        onSecondChange={(value) => patch({ is_second: value || null })}
        onGlazeChange={(value) => patch({ glaze_id: value || null })}
        onLowStockChange={(isOn) => patch({ low_stock: isOn ? "1" : null })}
      />
      {isFirstLoad ? (
        <div aria-busy="true" className="h-64 animate-pulse bg-ash" />
      ) : (
        <PiecesTable
          rows={optimisticRows}
          isBusy={loading || isPending}
          busyId={busyId}
          onActiveChange={handleActiveChange}
          onFeaturedChange={runFeatured}
          onAdjustStock={setStockId}
        />
      )}
      {pageInfo && (
        <AdminPagination
          page={pageInfo.page}
          limit={pageInfo.limit}
          total={pageInfo.total}
          hasMore={pageInfo.has_more}
          onPageChange={(next) => patch({ page: String(next) })}
        />
      )}
      <AdminConfirmDialog
        isOpen={archiveId !== null}
        title="Archive this piece?"
        description={`${archiveRow?.name ?? "This piece"} comes off the shelf at once. You can bring it back later.`}
        confirmLabel="Archive"
        isDestructive
        isBusy={busyId === archiveId}
        onConfirm={() => {
          if (archiveId !== null) runActive(archiveId, false);
          setArchiveId(null);
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) setArchiveId(null);
        }}
      />
      <StockAdjustDialog
        key={stockId ?? "none"}
        isOpen={stockId !== null}
        pieceName={stockRow?.name ?? "This piece"}
        stockLabel={stockRow?.stockLabel ?? "0"}
        isBusy={busyId === stockId}
        onSubmit={handleStockSubmit}
        onOpenChange={(isOpen) => {
          if (!isOpen) setStockId(null);
        }}
      />
    </div>
  );
}
