"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  type AdminGlazeInput,
  AdminGlazesDocument,
  CreateGlazeDocument,
  DeleteGlazeDocument,
  UpdateGlazeDocument,
  UploadPurpose,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type { AdminGlazeFormValues } from "@/lib/validations/admin/glaze";

import { useAdminQueryState, useSearchDraft } from "@/features/admin/shell";
import {
  AdminConfirmDialog,
  AdminPageHeader,
  AdminPagination,
  AdminSearchField,
  AdminToolbar,
} from "@/features/admin/ui";
import { ImageUploaderContainer } from "@/features/admin/uploads";

import { Button } from "@/components/ui/button";

import { GlazeEditorForm } from "@/features/admin/glazes/components/GlazeEditorForm";
import { GlazesTable } from "@/features/admin/glazes/components/GlazesTable";
import {
  applyGlazePatch,
  describeGlazeDeletion,
  EMPTY_GLAZE_FORM,
  GLAZES_PAGE_SIZE,
  type GlazeRow,
  toGlazeFormValues,
  toGlazeInput,
  toGlazeRow,
} from "@/features/admin/glazes/types";

// Only ever one draft at a time, and no saved glaze can hold this id.
const DRAFT_GLAZE_ID = 0;

interface DeleteTarget {
  id: number;
  name: string;
  productCount: number;
}

interface GlazeSave {
  id: number | null;
  input: AdminGlazeInput;
  row: GlazeRow;
}

export function GlazesContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.search ?? "";

  const commitSearch = useCallback(
    (value: string) => patch({ search: value === "" ? null : value }),
    [patch],
  );
  const [searchDraft, setSearchDraft] = useSearchDraft(search, commitSearch);

  const { data, previousData, loading, refetch } = useQuery(
    AdminGlazesDocument,
    {
      variables: {
        filter: {
          search: search === "" ? null : search,
          page,
          limit: GLAZES_PAGE_SIZE,
        },
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const [createGlaze] = useMutation(CreateGlazeDocument);
  const [updateGlaze] = useMutation(UpdateGlazeDocument);
  const [deleteGlaze] = useMutation(DeleteGlazeDocument);

  const [editorId, setEditorId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [swatchUrl, setSwatchUrl] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);

  const result = data?.adminGlazes ?? previousData?.adminGlazes;

  const rows = useMemo<GlazeRow[]>(
    () => (result?.items ?? []).map(toGlazeRow),
    [result],
  );

  const [optimisticRows, patchRows] = useOptimistic(rows, applyGlazePatch);

  const editedRow =
    editorId === null
      ? undefined
      : optimisticRows.find((row) => row.id === editorId);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditorId(null);
    setSwatchUrl(null);
  }, []);

  const handleEdit = useCallback(
    (id: number) => {
      const row = optimisticRows.find((item) => item.id === id);
      setEditorId(id);
      setSwatchUrl(row?.swatchUrl ?? null);
      setIsEditorOpen(true);
    },
    [optimisticRows],
  );

  const handleNew = useCallback(() => {
    setEditorId(null);
    setSwatchUrl(null);
    setIsEditorOpen(true);
  }, []);

  const { execute: saveGlaze, isPending: isSaving } = useOptimisticAction({
    patch: (draft: GlazeSave) => patchRows({ kind: "save", row: draft.row }),
    run: (draft) =>
      draft.id === null
        ? createGlaze({ variables: { input: draft.input } })
        : updateGlaze({ variables: { id: draft.id, input: draft.input } }),
    refresh: refetch,
    messages: {
      success: (draft) => (draft.id === null ? "Glaze added" : "Glaze saved"),
      failure: "The glaze could not be saved",
    },
    onSuccess: closeEditor,
  });

  const handleSubmit = useCallback(
    (formValues: AdminGlazeFormValues) => {
      const input = toGlazeInput(formValues, swatchUrl);
      saveGlaze({
        id: editorId,
        input,
        row: {
          id: editorId ?? DRAFT_GLAZE_ID,
          slug: editedRow?.slug ?? "",
          name: input.name,
          description: input.description,
          variationNote: input.variation_note ?? "",
          swatchUrl,
          colorCode: input.color_code ?? null,
          productCount: editedRow?.productCount ?? 0,
        },
      });
    },
    [editedRow, editorId, saveGlaze, swatchUrl],
  );

  const handleDelete = useCallback(
    (id: number) => {
      const row = optimisticRows.find((item) => item.id === id);
      if (!row) return;
      setPendingDelete({
        id,
        name: row.name,
        productCount: row.productCount,
      });
    },
    [optimisticRows],
  );

  const { execute: removeGlaze, isPending: isDeleting } = useOptimisticAction({
    patch: (target: DeleteTarget) =>
      patchRows({ kind: "remove", id: target.id }),
    run: (target) => deleteGlaze({ variables: { id: target.id } }),
    refresh: refetch,
    messages: {
      success: (target) => `${target.name} deleted`,
      failure: "The glaze could not be deleted",
    },
    onSuccess: () => setPendingDelete(null),
  });

  const handleDeleteConfirm = useCallback(() => {
    if (pendingDelete) removeGlaze(pendingDelete);
  }, [pendingDelete, removeGlaze]);

  const pageInfo = result?.page_info;

  const editor = (
    <GlazeEditorForm
      key={`glaze-${editorId ?? "new"}`}
      idPrefix={`glaze-${editorId ?? "new"}`}
      defaultValues={
        editedRow ? toGlazeFormValues(editedRow) : EMPTY_GLAZE_FORM
      }
      isSaving={isSaving}
      submitLabel={editorId === null ? "Add glaze" : "Save glaze"}
      swatchField={
        <ImageUploaderContainer
          id={`glaze-${editorId ?? "new"}-swatch`}
          label="Swatch"
          purpose={UploadPurpose.Glaze}
          value={swatchUrl}
          onChange={setSwatchUrl}
        />
      }
      onSubmit={handleSubmit}
      onCancel={closeEditor}
    />
  );

  if (!result && loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-20 animate-pulse bg-ash" />
        <div className="h-64 animate-pulse bg-ash" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Studio"
        title="Glazes"
        description="The colours the kiln gives back, and what to expect of each."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isEditorOpen}
            onClick={handleNew}
          >
            New glaze
          </Button>
        }
      />

      <AdminToolbar>
        <AdminSearchField
          id="glazes-search"
          label="Search"
          placeholder="Name"
          value={searchDraft}
          onChange={setSearchDraft}
        />
      </AdminToolbar>

      <GlazesTable
        rows={optimisticRows}
        isBusy={isPending || (loading && result !== undefined)}
        isEditorOpen={isEditorOpen}
        editorRowId={editorId}
        editor={editor}
        emptyMessage={
          search === "" ? "No glazes yet" : "No glazes match that search"
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
        isOpen={pendingDelete !== null}
        title="Delete this glaze?"
        description={
          pendingDelete
            ? describeGlazeDeletion(
                pendingDelete.name,
                pendingDelete.productCount,
              )
            : ""
        }
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
