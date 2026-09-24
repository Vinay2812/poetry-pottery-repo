"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminCategoriesDocument,
  type AdminCategoryInput,
  type AdminCollectionInput,
  AdminCollectionsDocument,
  CreateCategoryDocument,
  CreateCollectionDocument,
  DeleteCategoryDocument,
  DeleteCollectionDocument,
  UpdateCategoryDocument,
  UpdateCollectionDocument,
  UploadPurpose,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type {
  AdminCategoryFormValues,
  AdminCollectionFormValues,
} from "@/lib/validations/admin/catalog";

import {
  AdminConfirmDialog,
  AdminPageHeader,
  fromDateTimeLocal,
  toDateTimeLocal,
} from "@/features/admin/ui";
import { ImageUploaderContainer } from "@/features/admin/uploads";

import { CatalogSection } from "@/features/admin/catalog/components/CatalogSection";
import { CategoriesTable } from "@/features/admin/catalog/components/CategoriesTable";
import { CategoryEditorForm } from "@/features/admin/catalog/components/CategoryEditorForm";
import { CollectionEditorForm } from "@/features/admin/catalog/components/CollectionEditorForm";
import { CollectionsTable } from "@/features/admin/catalog/components/CollectionsTable";
import {
  applyCategoryPatch,
  applyCollectionPatch,
  type CatalogEditorKind,
  type CategoryRow,
  type CollectionRow,
  describeCategoryDeletion,
  describeCollectionDeletion,
  EMPTY_CATEGORY_FORM,
  EMPTY_COLLECTION_FORM,
} from "@/features/admin/catalog/types";

interface EditorTarget {
  kind: CatalogEditorKind;
  id: number | null;
}

interface DeleteTarget {
  kind: CatalogEditorKind;
  id: number;
  name: string;
  productCount: number;
}

interface CategorySave {
  id: number | null;
  // The raw form value; the input sends null for an empty icon.
  icon: string;
  input: AdminCategoryInput;
}

interface CollectionSave {
  id: number | null;
  description: string;
  input: AdminCollectionInput;
}

export function CatalogContainer() {
  const categoriesQuery = useQuery(AdminCategoriesDocument, {
    fetchPolicy: "cache-and-network",
  });
  const collectionsQuery = useQuery(AdminCollectionsDocument, {
    fetchPolicy: "cache-and-network",
  });

  const [createCategory] = useMutation(CreateCategoryDocument);
  const [updateCategory] = useMutation(UpdateCategoryDocument);
  const [deleteCategory] = useMutation(DeleteCategoryDocument);
  const [createCollection] = useMutation(CreateCollectionDocument);
  const [updateCollection] = useMutation(UpdateCollectionDocument);
  const [deleteCollection] = useMutation(DeleteCollectionDocument);

  const [editor, setEditor] = useState<EditorTarget | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);

  const categories = categoriesQuery.data ?? categoriesQuery.previousData;
  const collections = collectionsQuery.data ?? collectionsQuery.previousData;

  const categoryRows = useMemo<CategoryRow[]>(
    () =>
      (categories?.adminCategories ?? []).map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon ?? "",
        imageUrl: category.image_url ?? null,
        sortOrder: category.sort_order,
        productCount: category.product_count,
      })),
    [categories],
  );

  const collectionRows = useMemo<CollectionRow[]>(
    () =>
      (collections?.adminCollections ?? []).map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description ?? "",
        imageUrl: collection.image_url ?? null,
        startsAt: collection.starts_at ?? null,
        endsAt: collection.ends_at ?? null,
        productCount: collection.product_count,
      })),
    [collections],
  );

  const [optimisticCategories, patchCategories] = useOptimistic(
    categoryRows,
    applyCategoryPatch,
  );
  const [optimisticCollections, patchCollections] = useOptimistic(
    collectionRows,
    applyCollectionPatch,
  );

  const editedCategory =
    editor?.kind === "category" && editor.id !== null
      ? optimisticCategories.find((row) => row.id === editor.id)
      : undefined;
  const editedCollection =
    editor?.kind === "collection" && editor.id !== null
      ? optimisticCollections.find((row) => row.id === editor.id)
      : undefined;

  const categoryDefaults = useMemo<AdminCategoryFormValues>(() => {
    if (!editedCategory) return EMPTY_CATEGORY_FORM;
    return {
      name: editedCategory.name,
      icon: editedCategory.icon,
      sort_order: String(editedCategory.sortOrder),
    };
  }, [editedCategory]);

  const collectionDefaults = useMemo<AdminCollectionFormValues>(() => {
    if (!editedCollection) return EMPTY_COLLECTION_FORM;
    return {
      name: editedCollection.name,
      description: editedCollection.description,
      starts_at: toDateTimeLocal(editedCollection.startsAt),
      ends_at: toDateTimeLocal(editedCollection.endsAt),
    };
  }, [editedCollection]);

  const openEditor = useCallback(
    (kind: CatalogEditorKind, id: number | null, url: string | null) => {
      setEditor({ kind, id });
      setImageUrl(url);
    },
    [],
  );

  const handleCancel = useCallback(() => {
    setEditor(null);
    setImageUrl(null);
  }, []);

  const { execute: saveCategory, isPending: isCategorySaving } =
    useOptimisticAction({
      patch: (draft: CategorySave) => {
        if (draft.id === null) return;
        patchCategories({
          kind: "save",
          id: draft.id,
          name: draft.input.name,
          icon: draft.icon,
          imageUrl: draft.input.image_url ?? null,
        });
      },
      run: (draft) =>
        draft.id === null
          ? createCategory({ variables: { input: draft.input } })
          : updateCategory({ variables: { id: draft.id, input: draft.input } }),
      refresh: categoriesQuery.refetch,
      messages: {
        success: (draft) =>
          draft.id === null ? "Category added" : "Category saved",
        failure: "The category could not be saved",
      },
      onSuccess: handleCancel,
    });

  const handleCategorySubmit = useCallback(
    (values: AdminCategoryFormValues) => {
      saveCategory({
        id: editor?.id ?? null,
        icon: values.icon,
        input: {
          name: values.name,
          icon: values.icon === "" ? null : values.icon,
          image_url: imageUrl,
          sort_order: Number(values.sort_order),
        },
      });
    },
    [editor, imageUrl, saveCategory],
  );

  const { execute: saveCollection, isPending: isCollectionSaving } =
    useOptimisticAction({
      patch: (draft: CollectionSave) => {
        if (draft.id === null) return;
        patchCollections({
          kind: "save",
          id: draft.id,
          name: draft.input.name,
          description: draft.description,
          imageUrl: draft.input.image_url ?? null,
          startsAt: draft.input.starts_at ?? null,
          endsAt: draft.input.ends_at ?? null,
        });
      },
      run: (draft) =>
        draft.id === null
          ? createCollection({ variables: { input: draft.input } })
          : updateCollection({
              variables: { id: draft.id, input: draft.input },
            }),
      refresh: collectionsQuery.refetch,
      messages: {
        success: (draft) =>
          draft.id === null ? "Collection added" : "Collection saved",
        failure: "The collection could not be saved",
      },
      onSuccess: handleCancel,
    });

  const handleCollectionSubmit = useCallback(
    (values: AdminCollectionFormValues) => {
      saveCollection({
        id: editor?.id ?? null,
        description: values.description,
        input: {
          name: values.name,
          description: values.description === "" ? null : values.description,
          image_url: imageUrl,
          starts_at: fromDateTimeLocal(values.starts_at),
          ends_at: fromDateTimeLocal(values.ends_at),
        },
      });
    },
    [editor, imageUrl, saveCollection],
  );

  const isSaving = isCategorySaving || isCollectionSaving;

  const closeDeleteDialog = useCallback(() => setPendingDelete(null), []);

  // Each kind refetches only its own list, so the two deletes are separate actions.
  const { execute: removeCategory, isPending: isCategoryDeleting } =
    useOptimisticAction({
      patch: (target: DeleteTarget) =>
        patchCategories({ kind: "remove", id: target.id }),
      run: (target) => deleteCategory({ variables: { id: target.id } }),
      refresh: categoriesQuery.refetch,
      messages: {
        success: (target) => `${target.name} deleted`,
        failure: "The category could not be deleted",
      },
      onSuccess: closeDeleteDialog,
    });

  const { execute: removeCollection, isPending: isCollectionDeleting } =
    useOptimisticAction({
      patch: (target: DeleteTarget) =>
        patchCollections({ kind: "remove", id: target.id }),
      run: (target) => deleteCollection({ variables: { id: target.id } }),
      refresh: collectionsQuery.refetch,
      messages: {
        success: (target) => `${target.name} deleted`,
        failure: "The collection could not be deleted",
      },
      onSuccess: closeDeleteDialog,
    });

  const isDeleting = isCategoryDeleting || isCollectionDeleting;

  const handleDeleteConfirm = useCallback(() => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "category") removeCategory(pendingDelete);
    else removeCollection(pendingDelete);
  }, [pendingDelete, removeCategory, removeCollection]);

  const handleCategoryDelete = useCallback(
    (id: number) => {
      const row = optimisticCategories.find((item) => item.id === id);
      if (!row) return;
      setPendingDelete({
        kind: "category",
        id,
        name: row.name,
        productCount: row.productCount,
      });
    },
    [optimisticCategories],
  );

  const handleCollectionDelete = useCallback(
    (id: number) => {
      const row = optimisticCollections.find((item) => item.id === id);
      if (!row) return;
      setPendingDelete({
        kind: "collection",
        id,
        name: row.name,
        productCount: row.productCount,
      });
    },
    [optimisticCollections],
  );

  const isCategoryEditorOpen = editor?.kind === "category";
  const isCollectionEditorOpen = editor?.kind === "collection";
  const categoryEditorKey = `category-${editor?.id ?? "new"}`;
  const collectionEditorKey = `collection-${editor?.id ?? "new"}`;

  const deleteDescription = pendingDelete
    ? pendingDelete.kind === "category"
      ? describeCategoryDeletion(pendingDelete.name, pendingDelete.productCount)
      : describeCollectionDeletion(
          pendingDelete.name,
          pendingDelete.productCount,
        )
    : "";

  if (categories === undefined && collections === undefined) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-20 animate-pulse bg-ash" />
        <div className="h-64 animate-pulse bg-ash" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader
        eyebrow="Studio"
        title="Categories and collections"
        description="How the shelf is grouped, and what is on it right now."
      />

      <CatalogSection
        title="Categories"
        description="The shelves a piece can sit on. The order here is the order shoppers see."
        actionLabel="New category"
        isActionDisabled={editor !== null}
        onAction={() => openEditor("category", null, null)}
      >
        <CategoriesTable
          rows={optimisticCategories}
          isBusy={categoriesQuery.loading && categories !== undefined}
          isEditorOpen={isCategoryEditorOpen}
          editorRowId={isCategoryEditorOpen ? editor.id : null}
          editor={
            isCategoryEditorOpen ? (
              <CategoryEditorForm
                key={categoryEditorKey}
                idPrefix={categoryEditorKey}
                defaultValues={categoryDefaults}
                isSaving={isSaving}
                submitLabel={
                  editor.id === null ? "Add category" : "Save category"
                }
                imageField={
                  <ImageUploaderContainer
                    key={categoryEditorKey}
                    id={`${categoryEditorKey}-image`}
                    label="Category image"
                    purpose={UploadPurpose.Category}
                    value={imageUrl}
                    onChange={setImageUrl}
                  />
                }
                onSubmit={handleCategorySubmit}
                onCancel={handleCancel}
              />
            ) : null
          }
          onEdit={(id) => {
            const row = optimisticCategories.find((item) => item.id === id);
            openEditor("category", id, row?.imageUrl ?? null);
          }}
          onDelete={handleCategoryDelete}
        />
      </CatalogSection>

      <CatalogSection
        title="Collections"
        description="Groups with a start and an end, for a season or a firing."
        actionLabel="New collection"
        isActionDisabled={editor !== null}
        onAction={() => openEditor("collection", null, null)}
      >
        <CollectionsTable
          rows={optimisticCollections}
          isBusy={collectionsQuery.loading && collections !== undefined}
          isEditorOpen={isCollectionEditorOpen}
          editorRowId={isCollectionEditorOpen ? editor.id : null}
          editor={
            isCollectionEditorOpen ? (
              <CollectionEditorForm
                key={collectionEditorKey}
                idPrefix={collectionEditorKey}
                defaultValues={collectionDefaults}
                isSaving={isSaving}
                submitLabel={
                  editor.id === null ? "Add collection" : "Save collection"
                }
                imageField={
                  <ImageUploaderContainer
                    key={collectionEditorKey}
                    id={`${collectionEditorKey}-image`}
                    label="Collection image"
                    purpose={UploadPurpose.Collection}
                    value={imageUrl}
                    onChange={setImageUrl}
                  />
                }
                onSubmit={handleCollectionSubmit}
                onCancel={handleCancel}
              />
            ) : null
          }
          onEdit={(id) => {
            const row = optimisticCollections.find((item) => item.id === id);
            openEditor("collection", id, row?.imageUrl ?? null);
          }}
          onDelete={handleCollectionDelete}
        />
      </CatalogSection>

      <AdminConfirmDialog
        isOpen={pendingDelete !== null}
        title={
          pendingDelete?.kind === "collection"
            ? "Delete this collection?"
            : "Delete this category?"
        }
        description={deleteDescription}
        confirmLabel="Delete"
        isDestructive
        isBusy={isDeleting}
        onConfirm={handleDeleteConfirm}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingDelete(null);
        }}
      />
    </div>
  );
}
