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
  useDeleteWorkshopTierMutation,
  useSaveWorkshopTierMutation,
} from "@/graphql/generated/graphql";

import { formatInr } from "@/lib/format";
import type { WorkshopTierFormValues } from "@/lib/validations/admin/workshop";

import { toErrorMessage } from "@/features/admin/shell";
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
  const [saveTier] = useSaveWorkshopTierMutation();
  const [deleteTier] = useDeleteWorkshopTierMutation();
  const [optimisticTiers, patchTiers] = useOptimistic(tiers, applyTierPatch);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

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

  const handleSubmit = useCallback(
    (values: WorkshopTierFormValues) => {
      const id = editing?.id ?? 0;
      setBusyId(id);
      startTransition(async () => {
        patchTiers({ kind: "save", tier: { ...values, id } });
        try {
          // The API upserts on hours, so the payload carries the whole config back.
          await saveTier({ variables: { config_id: configId, input: values } });
          setEditingId(null);
          setIsAdding(false);
          toast.success("Price saved");
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setBusyId(null);
        }
      });
    },
    [configId, editing, patchTiers, saveTier],
  );

  const handleDelete = useCallback(() => {
    const tier = optimisticTiers.find((row) => row.id === deletingId);
    if (!tier) return;
    setBusyId(tier.id);
    startTransition(async () => {
      patchTiers({ kind: "remove", tier });
      try {
        await deleteTier({ variables: { id: tier.id } });
        await onRefetch();
        setDeletingId(null);
        toast.success("Price removed");
      } catch (error) {
        toast.error(toErrorMessage(error));
      } finally {
        setBusyId(null);
      }
    });
  }, [deletingId, deleteTier, onRefetch, optimisticTiers, patchTiers]);

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
        isBusy={busyId !== null}
        onSubmit={handleSubmit}
        onOpenChange={(isOpen) => {
          if (isOpen) return;
          setIsAdding(false);
          setEditingId(null);
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
