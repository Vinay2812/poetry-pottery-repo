"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  type AdminCouponInput,
  AdminCouponsDocument,
  CreateCouponDocument,
  DeleteCouponDocument,
  UpdateCouponDocument,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type { AdminCouponFormValues } from "@/lib/validations/admin/coupon";

import { useAdminQueryState, useSearchDraft } from "@/features/admin/shell";
import {
  AdminConfirmDialog,
  AdminPageHeader,
  AdminPagination,
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
  fromDateTimeLocal,
  toDateTimeLocal,
} from "@/features/admin/ui";

import { Button } from "@/components/ui/button";

import { CouponFormDialog } from "@/features/admin/coupons/components/CouponFormDialog";
import { CouponsTable } from "@/features/admin/coupons/components/CouponsTable";
import {
  applyCouponPatch,
  COUPONS_PAGE_SIZE,
  type CouponRow,
  describeCouponDeletion,
  EMPTY_COUPON_FORM,
  readActiveFilter,
  toCouponRow,
} from "@/features/admin/coupons/types";

// Only ever one draft at a time, and no saved coupon can hold this id.
const DRAFT_COUPON_ID = 0;

const ACTIVE_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Paused" },
];

interface DeleteTarget {
  id: number;
  code: string;
  usesCount: number;
}

interface CouponSave {
  id: number | null;
  input: AdminCouponInput;
  row: CouponRow;
}

export function CouponsContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.search ?? "";
  const activeValue = values.is_active ?? "";
  const isActive = readActiveFilter(values.is_active);

  const commitSearch = useCallback(
    (value: string) => patch({ search: value === "" ? null : value }),
    [patch],
  );
  const [searchDraft, setSearchDraft] = useSearchDraft(search, commitSearch);

  const { data, previousData, loading, refetch } = useQuery(
    AdminCouponsDocument,
    {
      variables: {
        filter: {
          search: search === "" ? null : search,
          is_active: isActive ?? null,
          page,
          limit: COUPONS_PAGE_SIZE,
        },
      },
      fetchPolicy: "cache-and-network",
    },
  );

  const [createCoupon] = useMutation(CreateCouponDocument);
  const [updateCoupon] = useMutation(UpdateCouponDocument);
  const [deleteCoupon] = useMutation(DeleteCouponDocument);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);

  const result = data?.adminCoupons ?? previousData?.adminCoupons;

  const rows = useMemo<CouponRow[]>(
    () => (result?.items ?? []).map(toCouponRow),
    [result],
  );

  const [optimisticRows, patchRows] = useOptimistic(rows, applyCouponPatch);

  const editedRow = optimisticRows.find((row) => row.id === editingId);

  const formDefaults = useMemo<AdminCouponFormValues>(() => {
    if (!editedRow) return EMPTY_COUPON_FORM;
    return {
      code: editedRow.code,
      kind: editedRow.kind,
      value: String(editedRow.value),
      min_order: String(editedRow.minOrder),
      max_uses: editedRow.maxUses === null ? "" : String(editedRow.maxUses),
      starts_at: toDateTimeLocal(editedRow.startsAt),
      expires_at: toDateTimeLocal(editedRow.expiresAt),
      is_active: editedRow.isActive,
    };
  }, [editedRow]);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingId(null);
  }, []);

  const {
    execute: saveCoupon,
    isPending: isSaving,
    pending: pendingSave,
  } = useOptimisticAction({
    patch: (draft: CouponSave) => patchRows({ kind: "save", row: draft.row }),
    run: (draft) =>
      draft.id === null
        ? createCoupon({ variables: { input: draft.input } })
        : updateCoupon({ variables: { id: draft.id, input: draft.input } }),
    refresh: refetch,
    messages: {
      success: (draft) => (draft.id === null ? "Code added" : "Code saved"),
      failure: "The code could not be saved",
    },
    onSuccess: closeForm,
  });

  const handleSubmit = useCallback(
    (formValues: AdminCouponFormValues) => {
      const id = editingId;
      const maxUses =
        formValues.max_uses === "" ? null : Number(formValues.max_uses);
      const input = {
        code: formValues.code,
        kind: formValues.kind,
        value: Number(formValues.value),
        min_order: Number(formValues.min_order),
        max_uses: maxUses,
        starts_at: fromDateTimeLocal(formValues.starts_at),
        expires_at: fromDateTimeLocal(formValues.expires_at),
        is_active: formValues.is_active,
      };
      saveCoupon({
        id,
        input,
        row: {
          id: id ?? DRAFT_COUPON_ID,
          code: input.code,
          kind: input.kind,
          value: input.value,
          minOrder: input.min_order,
          maxUses,
          usesCount: editedRow?.usesCount ?? 0,
          startsAt: input.starts_at,
          expiresAt: input.expires_at,
          isActive: input.is_active,
        },
      });
    },
    [editedRow, editingId, saveCoupon],
  );

  const {
    execute: removeCoupon,
    isPending: isDeleting,
    pending: pendingRemove,
  } = useOptimisticAction({
    patch: (target: DeleteTarget) =>
      patchRows({ kind: "remove", id: target.id }),
    run: (target) => deleteCoupon({ variables: { id: target.id } }),
    refresh: refetch,
    messages: {
      success: (target) => `${target.code} deleted`,
      failure: "The code could not be deleted",
    },
    onSuccess: () => setPendingDelete(null),
  });

  const handleDeleteConfirm = useCallback(() => {
    if (pendingDelete) removeCoupon(pendingDelete);
  }, [pendingDelete, removeCoupon]);

  const busyId = pendingSave?.row.id ?? pendingRemove?.id ?? null;

  const handleEdit = useCallback((id: number) => {
    setEditingId(id);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id: number) => {
      const row = optimisticRows.find((item) => item.id === id);
      if (!row) return;
      setPendingDelete({ id, code: row.code, usesCount: row.usesCount });
    },
    [optimisticRows],
  );

  const handleNew = useCallback(() => {
    setEditingId(null);
    setIsFormOpen(true);
  }, []);

  const hasFilters = search !== "" || isActive !== undefined;
  const pageInfo = result?.page_info;
  const formKey = `coupon-${editingId ?? "new"}`;

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
        title="Coupons"
        description="Codes shoppers can type at checkout."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleNew}
          >
            New code
          </Button>
        }
      />

      <AdminToolbar>
        <AdminSearchField
          id="coupons-search"
          label="Search"
          placeholder="Code"
          value={searchDraft}
          onChange={setSearchDraft}
        />
        <AdminSelectFilter
          id="coupons-active"
          label="Status"
          anyLabel="Any status"
          options={ACTIVE_OPTIONS}
          value={activeValue}
          onChange={(value) =>
            patch({ is_active: value === "" ? null : value })
          }
        />
      </AdminToolbar>

      <CouponsTable
        rows={optimisticRows}
        isBusy={isPending || (loading && result !== undefined)}
        busyId={busyId}
        emptyMessage={
          hasFilters ? "No codes match that search" : "No codes yet"
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

      <CouponFormDialog
        isOpen={isFormOpen}
        title={editingId === null ? "New code" : "Edit code"}
        description={
          editingId === null
            ? "A code shoppers can type at checkout."
            : "Changes apply the next time someone types it."
        }
        formKey={formKey}
        defaultValues={formDefaults}
        isSaving={isSaving}
        submitLabel={editingId === null ? "Add code" : "Save code"}
        onSubmit={handleSubmit}
        onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingId(null);
        }}
      />

      <AdminConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete this code?"
        description={
          pendingDelete
            ? describeCouponDeletion(
                pendingDelete.code,
                pendingDelete.usesCount,
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
