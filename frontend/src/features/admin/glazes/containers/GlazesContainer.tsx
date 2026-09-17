"use client";

import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";

import { toast } from "sonner";

import {
  UploadPurpose,
  useAdminGlazesQuery,
  useCreateGlazeMutation,
  useDeleteGlazeMutation,
  useUpdateGlazeMutation,
} from "@/graphql/generated/graphql";

import type { AdminGlazeFormValues } from "@/lib/validations/admin/glaze";

import {
  toErrorMessage,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
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

export function GlazesContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.search ?? "";

  const commitSearch = useCallback(
    (value: string) => patch({ search: value === "" ? null : value }),
    [patch],
  );
  const [searchDraft, setSearchDraft] = useSearchDraft(search, commitSearch);

  const { data, previousData, loading, refetch } = useAdminGlazesQuery({
    variables: {
      filter: {
        search: search === "" ? null : search,
        page,
        limit: GLAZES_PAGE_SIZE,
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const [createGlaze] = useCreateGlazeMutation();
  const [updateGlaze] = useUpdateGlazeMutation();
  const [deleteGlaze] = useDeleteGlazeMutation();

  const [editorId, setEditorId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [swatchUrl, setSwatchUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();

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

  const handleSubmit = useCallback(
    (formValues: AdminGlazeFormValues) => {
      const id = editorId;
      const input = toGlazeInput(formValues, swatchUrl);
      const draft: GlazeRow = {
        id: id ?? DRAFT_GLAZE_ID,
        slug: editedRow?.slug ?? "",
        name: input.name,
        description: input.description,
        variationNote: input.variation_note ?? "",
        swatchUrl,
        colorCode: input.color_code ?? null,
        productCount: editedRow?.productCount ?? 0,
      };
      setIsSaving(true);
      startTransition(async () => {
        patchRows({ kind: "save", row: draft });
        try {
          if (id === null) {
            await createGlaze({ variables: { input } });
          } else {
            await updateGlaze({ variables: { id, input } });
          }
          await refetch();
          closeEditor();
          toast.success(id === null ? "Glaze added" : "Glaze saved");
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setIsSaving(false);
        }
      });
    },
    [
      closeEditor,
      createGlaze,
      editedRow,
      editorId,
      patchRows,
      refetch,
      swatchUrl,
      updateGlaze,
    ],
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

  const handleDeleteConfirm = useCallback(() => {
    const target = pendingDelete;
    if (!target) return;
    setIsDeleting(true);
    startTransition(async () => {
      patchRows({ kind: "remove", id: target.id });
      try {
        await deleteGlaze({ variables: { id: target.id } });
        await refetch();
        setPendingDelete(null);
        toast.success(`${target.name} deleted`);
      } catch (error) {
        toast.error(toErrorMessage(error));
      } finally {
        setIsDeleting(false);
      }
    });
  }, [deleteGlaze, patchRows, pendingDelete, refetch]);

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
