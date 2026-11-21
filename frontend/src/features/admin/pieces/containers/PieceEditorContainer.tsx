"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useOptimistic, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdjustProductStockDocument,
  AdminCategoriesDocument,
  AdminCollectionsDocument,
  AdminGlazesDocument,
  AdminProductDocument,
  CreateProductDocument,
  SetProductActiveDocument,
  SetProductFeaturedDocument,
  UpdateProductDocument,
  UploadPurpose,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type { ProductFormValues } from "@/lib/validations/admin/product";

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
  canGoLive,
  describeKiln,
  describeKilnHint,
  describeShelfState,
  describeShelfStateHint,
  EMPTY_PRODUCT_FORM,
  formatStock,
  LIVE_BLOCKED_NOTE,
  toProductFormValues,
  toProductInput,
  toProductUpdateInput,
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

interface ActiveChange {
  id: number;
  isActive: boolean;
}

interface FeaturedChange {
  id: number;
  isFeatured: boolean;
}

interface StockChange {
  id: number;
  delta: number;
  reason: string;
}

interface PieceSave {
  values: ProductFormValues;
  imageUrls: string[];
}

export interface PieceEditorContainerProps {
  productId: number | null;
}

export function PieceEditorContainer({ productId }: PieceEditorContainerProps) {
  const router = useRouter();
  const isCreate = productId === null;

  const { data, loading, error, refetch } = useQuery(AdminProductDocument, {
    variables: { id: productId ?? 0 },
    skip: isCreate,
    fetchPolicy: "cache-and-network",
  });
  const { data: categoryData } = useQuery(AdminCategoriesDocument, {
    fetchPolicy: "cache-first",
  });
  const { data: collectionData } = useQuery(AdminCollectionsDocument, {
    fetchPolicy: "cache-first",
  });
  const { data: glazeData } = useQuery(AdminGlazesDocument, {
    variables: { filter: { page: 1, limit: GLAZE_PICKER_LIMIT } },
    fetchPolicy: "cache-first",
  });

  const [createProduct] = useMutation(CreateProductDocument);
  const [updateProduct] = useMutation(UpdateProductDocument);
  const [setActive] = useMutation(SetProductActiveDocument);
  const [setFeatured] = useMutation(SetProductFeaturedDocument);
  const [adjustStock] = useMutation(AdjustProductStockDocument);

  const [isRetireOpen, setIsRetireOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [imageDraft, setImageDraft] = useState<string[] | null>(null);

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

  const createPiece = useCallback(
    async (save: PieceSave) => {
      const created = await createProduct({
        variables: { input: toProductInput(save.values, save.imageUrls) },
      });
      const id = created.data?.createProduct.id;
      if (id === undefined) throw new Error("The piece could not be saved");
      return id;
    },
    [createProduct],
  );

  // A new piece has no query to read back; it navigates to its own page instead.
  const { execute: savePiece, isPending: isSaving } = useOptimisticAction({
    run: (save: PieceSave) =>
      productId === null
        ? createPiece(save)
        : updateProduct({
            variables: {
              id: productId,
              input: toProductUpdateInput(save.values, save.imageUrls),
            },
          }),
    refresh: isCreate ? undefined : refetch,
    messages: {
      success: isCreate ? "Piece created" : "Piece saved",
      failure: "The piece could not be saved",
    },
    onSuccess: (result) => {
      if (typeof result === "number") {
        router.push(`/dashboard/pieces/${result}`);
        return;
      }
      setImageDraft(null);
    },
  });

  const handleSubmit = useCallback(
    (values: ProductFormValues) => savePiece({ values, imageUrls }),
    [imageUrls, savePiece],
  );

  const { execute: saveActive, isPending: isActiveBusy } = useOptimisticAction({
    patch: (change: ActiveChange) =>
      patchState({ kind: "active", isActive: change.isActive }),
    run: (change) =>
      setActive({ variables: { id: change.id, is_active: change.isActive } }),
    refresh: refetch,
    messages: {
      success: (change) =>
        change.isActive ? "Back on the shelf" : "Retired to the archive",
      failure: "The piece could not be moved",
    },
  });

  const runActive = useCallback(
    (isActive: boolean) => {
      if (productId === null) return;
      saveActive({ id: productId, isActive });
    },
    [productId, saveActive],
  );

  const { execute: saveFeatured, isPending: isFeaturedBusy } =
    useOptimisticAction({
      patch: (change: FeaturedChange) =>
        patchState({ kind: "featured", isFeatured: change.isFeatured }),
      run: (change) =>
        setFeatured({
          variables: { id: change.id, is_featured: change.isFeatured },
        }),
      refresh: refetch,
      messages: { success: null, failure: "The piece could not be featured" },
    });

  const runFeatured = useCallback(
    (isFeatured: boolean) => {
      if (productId === null) return;
      saveFeatured({ id: productId, isFeatured });
    },
    [productId, saveFeatured],
  );

  const { execute: saveStock, isPending: isStockBusy } = useOptimisticAction({
    patch: (change: StockChange) =>
      patchState({ kind: "stock", delta: change.delta }),
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

  const isBusy = isActiveBusy || isFeaturedBusy || isStockBusy;

  const handleStockSubmit = useCallback(
    (delta: number, reason: string) => {
      if (productId === null) return;
      setIsStockOpen(false);
      saveStock({ id: productId, delta, reason });
    },
    [productId, saveStock],
  );

  const leave = useCallback(() => router.push("/dashboard/pieces"), [router]);

  // Unsaved fields or photos ask first; a clean form just goes back.
  const handleCancel = useCallback(
    (hasChanges: boolean) => {
      if (hasChanges || imageDraft !== null) {
        setIsLeaveOpen(true);
        return;
      }
      leave();
    },
    [imageDraft, leave],
  );

  const handleInvalid = useCallback(
    () => toast.error("Some fields need a look before this can be saved"),
    [],
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
            {error
              ? describeError(error, "That piece could not be found.")
              : "That piece could not be found."}
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
            ? "It goes on the shelf once it has stock, or is made to order."
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
                Change the stock
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isBusy}
                onClick={() => runFeatured(!state.isFeatured)}
              >
                {state.isFeatured
                  ? "Take off the home page"
                  : "Show on the home page"}
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
                    setIsRetireOpen(true);
                    return;
                  }
                  runActive(true);
                }}
              >
                {state.isActive ? "Retire" : "Put back on the shelf"}
              </Button>
            </>
          )
        }
      />

      {!isCreate && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AdminStatTile
            label="Stock"
            value={formatStock(state.stock)}
            hint={product?.is_customizable ? "Made to order" : "In this batch"}
          />
          <AdminStatTile
            label="State"
            value={describeShelfState(state.isActive)}
            hint={describeShelfStateHint(
              state.isActive,
              isLiveAllowed,
              state.isFeatured,
            )}
          />
          <AdminStatTile
            label="Sold"
            value={String(product?.sales_count ?? 0)}
            hint="All time"
          />
          <AdminStatTile
            label="Kiln"
            value={describeKiln(product?.is_second ?? false)}
            hint={describeKilnHint(product?.is_second ?? false)}
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
        onInvalid={handleInvalid}
        onCancel={handleCancel}
      />

      {productId !== null && <OptionGroupsContainer productId={productId} />}

      <AdminConfirmDialog
        isOpen={isRetireOpen}
        title="Retire this piece?"
        description="It comes off the shelf and moves to the archive. You can put it back later."
        confirmLabel="Retire"
        isDestructive
        isBusy={isBusy}
        onConfirm={() => {
          runActive(false);
          setIsRetireOpen(false);
        }}
        onOpenChange={setIsRetireOpen}
      />

      <AdminConfirmDialog
        isOpen={isLeaveOpen}
        title="Leave without saving?"
        description="The changes on this page, photos included, are not saved yet."
        confirmLabel="Leave without saving"
        isDestructive
        isBusy={false}
        onConfirm={leave}
        onOpenChange={setIsLeaveOpen}
      />

      <StockAdjustDialog
        key={isStockOpen ? "stock-open" : "stock-closed"}
        isOpen={isStockOpen}
        pieceName={product?.name ?? "This piece"}
        stock={state.stock}
        isBusy={isBusy}
        onSubmit={handleStockSubmit}
        onOpenChange={setIsStockOpen}
      />
    </div>
  );
}
