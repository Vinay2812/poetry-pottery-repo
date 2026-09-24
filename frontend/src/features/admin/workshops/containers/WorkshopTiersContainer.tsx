"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation } from "@apollo/client/react";
import {
  DeleteWorkshopTierDocument,
  SaveWorkshopTierDocument,
} from "@/graphql/generated/graphql";

import { formatInr } from "@/lib/format";
import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type { WorkshopTierFormValues } from "@/lib/validations/admin/workshop";

import { AdminConfirmDialog } from "@/features/admin/ui";

import { WorkshopTierDialog } from "@/features/admin/workshops/components/WorkshopTierDialog";
import {
  WorkshopTiersTable,
  type WorkshopTierRow,
} from "@/features/admin/workshops/components/WorkshopTiersTable";
import {
  applyTierPatch,
  formatHoursLabel,
  type WorkshopTierData,
} from "@/features/admin/workshops/types";

interface TierSave {
  id: number;
  values: WorkshopTierFormValues;
}

export interface WorkshopTiersContainerProps {
  configId: number;
  tiers: WorkshopTierData[];
  onRefetch: () => Promise<unknown>;
}

const NEW_TIER: WorkshopTierData = {
  id: 0,
  hours: 1,
  price_per_person: 0,
  pieces_per_person: 1,
};

export function WorkshopTiersContainer({
  configId,
  tiers,
  onRefetch,
}: WorkshopTiersContainerProps) {
  const [saveTier] = useMutation(SaveWorkshopTierDocument);
  const [deleteTier] = useMutation(DeleteWorkshopTierDocument);
  const [optimisticTiers, patchTiers] = useOptimistic(tiers, applyTierPatch);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [hoursError, setHoursError] = useState<string | null>(null);

  const editing = useMemo(
    () => optimisticTiers.find((tier) => tier.id === editingId) ?? null,
    [editingId, optimisticTiers],
  );

  const rows = useMemo<WorkshopTierRow[]>(
    () =>
      optimisticTiers.map((tier) => ({
        id: tier.id,
        hoursLabel: formatHoursLabel(tier.hours),
        priceLabel: formatInr(tier.price_per_person),
        piecesLabel: String(tier.pieces_per_person),
      })),
    [optimisticTiers],
  );

  // The API upserts on hours, so the payload carries the whole config back.
  const {
    execute: saveTierRow,
    isPending: isSaving,
    pending: pendingSave,
  } = useOptimisticAction({
    patch: (save: TierSave) =>
      patchTiers({ kind: "save", tier: { ...save.values, id: save.id } }),
    run: (save) =>
      saveTier({ variables: { config_id: configId, input: save.values } }),
    messages: {
      success: "Price saved",
      failure: "The price could not be saved",
    },
    onSuccess: () => {
      setEditingId(null);
      setIsAdding(false);
    },
  });

  // The API upserts on hours, so adding a length that already exists would quietly reprice it.
  const handleSubmit = useCallback(
    (values: WorkshopTierFormValues) => {
      const isTaken =
        editing === null &&
        optimisticTiers.some((tier) => tier.hours === values.hours);
      if (isTaken) {
        setHoursError(
          `${formatHoursLabel(values.hours)} already has a price. Edit that row instead.`,
        );
        return;
      }
      setHoursError(null);
      saveTierRow({ id: editing?.id ?? 0, values });
    },
    [editing, optimisticTiers, saveTierRow],
  );

  const {
    execute: removeTier,
    isPending: isDeleting,
    pending: pendingRemove,
  } = useOptimisticAction({
    patch: (tier: WorkshopTierData) => patchTiers({ kind: "remove", tier }),
    run: (tier) => deleteTier({ variables: { id: tier.id } }),
    refresh: onRefetch,
    messages: {
      success: "Price removed",
      failure: "The price could not be removed",
    },
    onSuccess: () => setDeletingId(null),
  });

  const handleDelete = useCallback(() => {
    const tier = optimisticTiers.find((row) => row.id === deletingId);
    if (tier) removeTier(tier);
  }, [deletingId, optimisticTiers, removeTier]);

  const busyId = pendingSave?.id ?? pendingRemove?.id ?? null;
  const isPending = isSaving || isDeleting;

  const draft = editing ?? NEW_TIER;

  return (
    <>
      <WorkshopTiersTable
        rows={rows}
        isBusy={isPending}
        busyId={busyId}
        onAdd={() => setIsAdding(true)}
        onEdit={setEditingId}
        onDelete={setDeletingId}
      />
      <WorkshopTierDialog
        // A fresh form each time the dialog opens on a different row.
        key={`tier-${editing?.id ?? "new"}`}
        isOpen={isAdding || editing !== null}
        isEditing={editing !== null}
        hours={draft.hours}
        pricePerPerson={draft.price_per_person}
        piecesPerPerson={draft.pieces_per_person}
        hoursError={hoursError}
        isBusy={busyId !== null}
        onSubmit={handleSubmit}
        onOpenChange={(isOpen) => {
          if (isOpen) return;
          setIsAdding(false);
          setEditingId(null);
          setHoursError(null);
        }}
      />
      <AdminConfirmDialog
        isOpen={deletingId !== null}
        title="Remove this length?"
        description="People will no longer be able to book a session of this length."
        confirmLabel="Remove"
        isDestructive
        isBusy={busyId !== null}
        onConfirm={handleDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeletingId(null);
        }}
      />
    </>
  );
}
