"use client";

import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";

import { toast } from "sonner";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminCategoriesDocument,
  AdminCollectionsDocument,
  CreateCategoryDocument,
  CreateCollectionDocument,
  DeleteCategoryDocument,
  DeleteCollectionDocument,
  UpdateCategoryDocument,
  UpdateCollectionDocument,
  UploadPurpose,
} from "@/graphql/generated/graphql";

import type {
  AdminCategoryFormValues,
  AdminCollectionFormValues,
} from "@/lib/validations/admin/catalog";

import { toErrorMessage } from "@/features/admin/shell";
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
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();

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

  const handleCategorySubmit = useCallback(
    (values: AdminCategoryFormValues) => {
      const id = editor?.id ?? null;
      const input = {
        name: values.name,
        icon: values.icon === "" ? null : values.icon,
        image_url: imageUrl,
        sort_order: Number(values.sort_order),
      };
      setIsSaving(true);
      startTransition(async () => {
        if (id !== null) {
          patchCategories({
            kind: "save",
            id,
            name: input.name,
            icon: values.icon,
            imageUrl,
          });
        }
        try {
          if (id === null) {
            await createCategory({ variables: { input } });
          } else {
            await updateCategory({ variables: { id, input } });
          }
          await categoriesQuery.refetch();
          setEditor(null);
          setImageUrl(null);
          toast.success(id === null ? "Category added" : "Category saved");
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setIsSaving(false);
        }
      });
    },
    [
      categoriesQuery,
      createCategory,
      editor,
      imageUrl,
      patchCategories,
      updateCategory,
    ],
  );

  const handleCollectionSubmit = useCallback(
    (values: AdminCollectionFormValues) => {
      const id = editor?.id ?? null;
      const startsAt = fromDateTimeLocal(values.starts_at);
      const endsAt = fromDateTimeLocal(values.ends_at);
      const input = {
        name: values.name,
        description: values.description === "" ? null : values.description,
        image_url: imageUrl,
        starts_at: startsAt,
        ends_at: endsAt,
      };
      setIsSaving(true);
      startTransition(async () => {
        if (id !== null) {
          patchCollections({
            kind: "save",
            id,
            name: values.name,
            description: values.description,
            imageUrl,
            startsAt,
            endsAt,
          });
        }
        try {
          if (id === null) {
            await createCollection({ variables: { input } });
          } else {
            await updateCollection({ variables: { id, input } });
          }
          await collectionsQuery.refetch();
          setEditor(null);
          setImageUrl(null);
          toast.success(id === null ? "Collection added" : "Collection saved");
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setIsSaving(false);
        }
      });
    },
    [
      collectionsQuery,
      createCollection,
      editor,
      imageUrl,
      patchCollections,
      updateCollection,
    ],
  );

  const handleDeleteConfirm = useCallback(() => {
    const target = pendingDelete;
    if (!target) return;
    setIsDeleting(true);
    startTransition(async () => {
      if (target.kind === "category") {
        patchCategories({ kind: "remove", id: target.id });
      } else {
        patchCollections({ kind: "remove", id: target.id });
      }
      try {
        if (target.kind === "category") {
          await deleteCategory({ variables: { id: target.id } });
          await categoriesQuery.refetch();
        } else {
          await deleteCollection({ variables: { id: target.id } });
          await collectionsQuery.refetch();
        }
        setPendingDelete(null);
        toast.success(`${target.name} deleted`);
      } catch (error) {
        toast.error(toErrorMessage(error));
      } finally {
        setIsDeleting(false);
      }
    });
  }, [
    categoriesQuery,
    collectionsQuery,
    deleteCategory,
    deleteCollection,
    patchCategories,
    patchCollections,
    pendingDelete,
  ]);

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
