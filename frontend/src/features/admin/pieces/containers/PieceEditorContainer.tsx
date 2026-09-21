"use client";

import { useRouter } from "next/navigation";
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
  UploadPurpose,
  useAdjustProductStockMutation,
  useAdminCategoriesQuery,
  useAdminCollectionsQuery,
  useAdminGlazesQuery,
  useAdminProductQuery,
  useCreateProductMutation,
  useSetProductActiveMutation,
  useSetProductFeaturedMutation,
  useUpdateProductMutation,
} from "@/graphql/generated/graphql";

import type { ProductFormValues } from "@/lib/validations/admin/product";

import { toErrorMessage } from "@/features/admin/shell";
import {
  AdminConfirmDialog,
  AdminPageHeader,
  AdminStatTile,
} from "@/features/admin/ui";
import { ImageListUploaderContainer } from "@/features/admin/uploads";

import { PieceForm } from "@/features/admin/pieces/components/PieceForm";
import { StockAdjustDialog } from "@/features/admin/pieces/components/StockAdjustDialog";
import { OptionGroupsContainer } from "@/features/admin/pieces/containers/OptionGroupsContainer";
import {
  applyStockDelta,
  describeSizeAndWeight,
  EMPTY_PRODUCT_FORM,
  formatStock,
  toProductFormValues,
  toProductInput,
  toProductUpdateInput,
  canGoLive,
  LIVE_BLOCKED_NOTE,
} from "@/features/admin/pieces/types";

// The picker lists every glaze the studio fires; there are never many.
const GLAZE_PICKER_LIMIT = 60;

interface PieceState {
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
}

type PieceStatePatch =
  | { kind: "stock"; delta: number }
  | { kind: "active"; isActive: boolean }
  | { kind: "featured"; isFeatured: boolean };

function applyPieceStatePatch(
  state: PieceState,
  patch: PieceStatePatch,
): PieceState {
  if (patch.kind === "stock") {
    return { ...state, stock: applyStockDelta(state.stock, patch.delta) };
  }
  if (patch.kind === "active") {
    return { ...state, isActive: patch.isActive };
  }
  return { ...state, isFeatured: patch.isFeatured };
}

export interface PieceEditorContainerProps {
  productId: number | null;
}

export function PieceEditorContainer({ productId }: PieceEditorContainerProps) {
  const router = useRouter();
  const isCreate = productId === null;

  const { data, loading, error, refetch } = useAdminProductQuery({
    variables: { id: productId ?? 0 },
    skip: isCreate,
    fetchPolicy: "cache-and-network",
  });
  const { data: categoryData } = useAdminCategoriesQuery({
    fetchPolicy: "cache-first",
  });
  const { data: collectionData } = useAdminCollectionsQuery({
    fetchPolicy: "cache-first",
  });
  const { data: glazeData } = useAdminGlazesQuery({
    variables: { filter: { page: 1, limit: GLAZE_PICKER_LIMIT } },
    fetchPolicy: "cache-first",
  });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [setActive] = useSetProductActiveMutation();
  const [setFeatured] = useSetProductFeaturedMutation();
  const [adjustStock] = useAdjustProductStockMutation();

  const [isSaving, setIsSaving] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [imageDraft, setImageDraft] = useState<string[] | null>(null);
  const [, startTransition] = useTransition();

  const product = data?.adminProduct ?? null;

  const baseState = useMemo<PieceState>(
    () => ({
      stock: product?.stock ?? 0,
      isActive: product?.is_active ?? true,
      isFeatured: product?.is_featured ?? false,
    }),
    [product],
  );
  const [state, patchState] = useOptimistic(baseState, applyPieceStatePatch);
  const isLiveAllowed = canGoLive(
    state.stock,
    product?.is_customizable ?? false,
  );

  // The draft wins until a save clears it; before that the saved gallery is the truth.
  const imageUrls = useMemo(
    () => imageDraft ?? product?.image_urls ?? [],
    [imageDraft, product],
  );

  const categoryOptions = useMemo(
    () =>
      (categoryData?.adminCategories ?? []).map((category) => ({
        id: category.id,
        name: category.name,
      })),
    [categoryData],
  );
  const collectionOptions = useMemo(
    () =>
      (collectionData?.adminCollections ?? []).map((collection) => ({
        id: collection.id,
        name: collection.name,
      })),
    [collectionData],
  );
  const glazeOptions = useMemo(
    () =>
      (glazeData?.adminGlazes.items ?? []).map((row) => ({
        id: row.glaze.id,
        name: row.glaze.name,
      })),
    [glazeData],
  );

  const handleSubmit = useCallback(
    (values: ProductFormValues) => {
      setIsSaving(true);
      void (async () => {
        try {
          if (productId === null) {
            const created = await createProduct({
              variables: { input: toProductInput(values, imageUrls) },
            });
            const id = created.data?.createProduct.id;
            if (id === undefined)
              throw new Error("The piece could not be saved");
            toast.success("Piece created");
            router.push(`/dashboard/pieces/${id}`);
            return;
          }
          await updateProduct({
            variables: {
              id: productId,
              input: toProductUpdateInput(values, imageUrls),
            },
          });
          setImageDraft(null);
          await refetch();
          toast.success("Piece saved");
        } catch (caught) {
          toast.error(toErrorMessage(caught));
        } finally {
          setIsSaving(false);
        }
      })();
    },
    [createProduct, imageUrls, productId, refetch, router, updateProduct],
  );

  const runActive = useCallback(
    (isActive: boolean) => {
      if (productId === null) return;
      setIsBusy(true);
      startTransition(async () => {
        patchState({ kind: "active", isActive });
        try {
          await setActive({
            variables: { id: productId, is_active: isActive },
          });
          await refetch();
          toast.success(
            isActive ? "Back on the shelf" : "Moved to the archive",
          );
        } catch (caught) {
          toast.error(toErrorMessage(caught));
        } finally {
          setIsBusy(false);
        }
      });
    },
    [patchState, productId, refetch, setActive],
  );

  const runFeatured = useCallback(
    (isFeatured: boolean) => {
      if (productId === null) return;
      setIsBusy(true);
      startTransition(async () => {
        patchState({ kind: "featured", isFeatured });
        try {
          await setFeatured({
            variables: { id: productId, is_featured: isFeatured },
          });
          await refetch();
        } catch (caught) {
          toast.error(toErrorMessage(caught));
        } finally {
          setIsBusy(false);
        }
      });
    },
    [patchState, productId, refetch, setFeatured],
  );

  const handleStockSubmit = useCallback(
    (delta: number, reason: string) => {
      if (productId === null) return;
      setIsStockOpen(false);
      setIsBusy(true);
      startTransition(async () => {
        patchState({ kind: "stock", delta });
        try {
          await adjustStock({ variables: { id: productId, delta, reason } });
          await refetch();
          toast.success("Stock updated");
        } catch (caught) {
          toast.error(toErrorMessage(caught));
        } finally {
          setIsBusy(false);
        }
      });
    },
    [adjustStock, patchState, productId, refetch],
  );

  const handleCancel = useCallback(
    () => router.push("/dashboard/pieces"),
    [router],
  );

  if (!isCreate && !product) {
    return (
      <div className="flex flex-col gap-4">
        <AdminPageHeader
          eyebrow="Pieces"
          title="Piece"
          description={null}
          actions={null}
        />
        {loading ? (
          <div aria-busy="true" className="h-64 animate-pulse bg-ash" />
        ) : (
          <p className="text-[13px]">
            {error ? toErrorMessage(error) : "That piece could not be found."}
          </p>
        )}
      </div>
    );
  }

  const gallery = (
    <ImageListUploaderContainer
      id="piece-photos"
      label="Add a photo"
      purpose={UploadPurpose.Product}
      urls={imageUrls}
      onChange={setImageDraft}
    />
  );

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Pieces"
        title={isCreate ? "New piece" : (product?.name ?? "Piece")}
        description={
          isCreate
            ? "A piece goes live once it has a photo and a price."
            : "Edit the piece, its photos and its options."
        }
        actions={
          isCreate ? null : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isBusy}
                onClick={() => setIsStockOpen(true)}
              >
                Adjust stock
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isBusy}
                onClick={() => runFeatured(!state.isFeatured)}
              >
                {state.isFeatured ? "Unfeature" : "Feature"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isBusy || (!state.isActive && !isLiveAllowed)}
                title={
                  !state.isActive && !isLiveAllowed
                    ? LIVE_BLOCKED_NOTE
                    : undefined
                }
                onClick={() => {
                  if (state.isActive) {
                    setIsArchiveOpen(true);
                    return;
                  }
                  runActive(true);
                }}
              >
                {state.isActive ? "Archive" : "Restore"}
              </Button>
            </>
          )
        }
      />

      {!isCreate && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatTile
            label="Stock"
            value={formatStock(state.stock)}
            hint="On the shelf right now"
          />
          <AdminStatTile
            label="State"
            value={state.isActive ? "Live" : "Archived"}
            hint={
              !state.isActive && !isLiveAllowed
                ? LIVE_BLOCKED_NOTE
                : state.isFeatured
                  ? "Featured on the home page"
                  : null
            }
          />
          <AdminStatTile
            label="Sold"
            value={String(product?.sales_count ?? 0)}
            hint="All time"
          />
          <AdminStatTile
            label="In the hand"
            value={product?.is_second ? "Second" : "First"}
            hint={describeSizeAndWeight({
              capacityMl: product?.capacity_ml ?? null,
              heightCm: product?.height_cm ?? null,
              diameterCm: product?.diameter_cm ?? null,
              weightG: product?.weight_g ?? null,
            })}
          />
        </div>
      )}

      <PieceForm
        key={product?.id ?? "new"}
        defaultValues={
          product ? toProductFormValues(product) : EMPTY_PRODUCT_FORM
        }
        isCreate={isCreate}
        isSubmitting={isSaving}
        submitLabel={isCreate ? "Create piece" : "Save changes"}
        categoryOptions={categoryOptions}
        collectionOptions={collectionOptions}
        glazeOptions={glazeOptions}
        gallery={gallery}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />

      {productId !== null && <OptionGroupsContainer productId={productId} />}

      <AdminConfirmDialog
        isOpen={isArchiveOpen}
        title="Archive this piece?"
        description="It comes off the shelf at once. You can bring it back later."
        confirmLabel="Archive"
        isDestructive
        isBusy={isBusy}
        onConfirm={() => {
          runActive(false);
          setIsArchiveOpen(false);
        }}
        onOpenChange={setIsArchiveOpen}
      />

      <StockAdjustDialog
        key={isStockOpen ? "stock-open" : "stock-closed"}
        isOpen={isStockOpen}
        pieceName={product?.name ?? "This piece"}
        stockLabel={formatStock(state.stock)}
        isBusy={isBusy}
        onSubmit={handleStockSubmit}
        onOpenChange={setIsStockOpen}
      />
    </div>
  );
}
