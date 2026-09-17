"use client";

import Link from "next/link";
import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  useAdjustProductStockMutation,
  useAdminCategoriesQuery,
  useAdminCollectionsQuery,
  useAdminGlazesQuery,
  useAdminProductsQuery,
  useSetProductActiveMutation,
  useSetProductFeaturedMutation,
} from "@/graphql/generated/graphql";

import { formatInr } from "@/lib/format";

import {
  toErrorMessage,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
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
} from "@/features/admin/pieces/types";

// The filter lists every glaze the studio fires; there are never many.
const GLAZE_FILTER_LIMIT = 60;

type RowPatch =
  | { kind: "active"; id: number; isActive: boolean }
  | { kind: "featured"; id: number; isFeatured: boolean }
  | { kind: "stock"; id: number; delta: number };

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

  const { data, previousData, loading, refetch } = useAdminProductsQuery({
    variables: { filter },
    fetchPolicy: "cache-and-network",
  });
  const { data: categoryData } = useAdminCategoriesQuery({
    fetchPolicy: "cache-first",
  });
  const { data: collectionData } = useAdminCollectionsQuery({
    fetchPolicy: "cache-first",
  });
  const { data: glazeData } = useAdminGlazesQuery({
    variables: { filter: { page: 1, limit: GLAZE_FILTER_LIMIT } },
    fetchPolicy: "cache-first",
  });

  const [setActive] = useSetProductActiveMutation();
  const [setFeatured] = useSetProductFeaturedMutation();
  const [adjustStock] = useAdjustProductStockMutation();

  const [busyId, setBusyId] = useState<number | null>(null);
  const [archiveId, setArchiveId] = useState<number | null>(null);
  const [stockId, setStockId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

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

  const runFeatured = useCallback(
    (id: number, isFeatured: boolean) => {
      setBusyId(id);
      startTransition(async () => {
        patchRow({ kind: "featured", id, isFeatured });
        try {
          await setFeatured({ variables: { id, is_featured: isFeatured } });
          await refetch();
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setBusyId(null);
        }
      });
    },
    [patchRow, refetch, setFeatured],
  );

  const runActive = useCallback(
    (id: number, isActive: boolean) => {
      setBusyId(id);
      startTransition(async () => {
        patchRow({ kind: "active", id, isActive });
        try {
          await setActive({ variables: { id, is_active: isActive } });
          await refetch();
          toast.success(
            isActive ? "Back on the shelf" : "Moved to the archive",
          );
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setBusyId(null);
        }
      });
    },
    [patchRow, refetch, setActive],
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

  const handleStockSubmit = useCallback(
    (delta: number, reason: string) => {
      const id = stockId;
      if (id === null) return;
      setStockId(null);
      setBusyId(id);
      startTransition(async () => {
        patchRow({ kind: "stock", id, delta });
        try {
          await adjustStock({ variables: { id, delta, reason } });
          await refetch();
          toast.success("Stock updated");
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setBusyId(null);
        }
      });
    },
    [adjustStock, patchRow, refetch, stockId],
  );

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
