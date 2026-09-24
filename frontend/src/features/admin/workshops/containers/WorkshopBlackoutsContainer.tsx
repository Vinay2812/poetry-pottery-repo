"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  type AdminWorkshopBlackoutInput,
  AdminWorkshopBlackoutsDocument,
  CreateWorkshopBlackoutDocument,
  DeleteWorkshopBlackoutDocument,
  UpdateWorkshopBlackoutDocument,
} from "@/graphql/generated/graphql";

import { formatDateTime } from "@/lib/format";
import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type { WorkshopBlackoutFormValues } from "@/lib/validations/admin/workshop";

import { AdminConfirmDialog } from "@/features/admin/ui";

import { WorkshopBlackoutDialog } from "@/features/admin/workshops/components/WorkshopBlackoutDialog";
import {
  WorkshopBlackoutsTable,
  type WorkshopBlackoutRow,
} from "@/features/admin/workshops/components/WorkshopBlackoutsTable";
import {
  applyBlackoutPatch,
  fromDateTimeLocal,
  toDateTimeLocal,
  type WorkshopBlackoutData,
} from "@/features/admin/workshops/types";

interface BlackoutSave {
  id: number | null;
  input: AdminWorkshopBlackoutInput;
  blackout: WorkshopBlackoutData;
}

export interface WorkshopBlackoutsContainerProps {
  configId: number;
  timezone: string;
}

export function WorkshopBlackoutsContainer({
  configId,
  timezone,
}: WorkshopBlackoutsContainerProps) {
  const { data, previousData, refetch } = useQuery(
    AdminWorkshopBlackoutsDocument,
    {
      variables: { config_id: configId },
      fetchPolicy: "cache-and-network",
    },
  );
  const [createBlackout] = useMutation(CreateWorkshopBlackoutDocument);
  const [updateBlackout] = useMutation(UpdateWorkshopBlackoutDocument);
  const [deleteBlackout] = useMutation(DeleteWorkshopBlackoutDocument);

  const blackouts = useMemo(
    () =>
      data?.adminWorkshopBlackouts ??
      previousData?.adminWorkshopBlackouts ??
      [],
    [data, previousData],
  );
  const [optimisticBlackouts, patchBlackouts] = useOptimistic(
    blackouts,
    applyBlackoutPatch,
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const editing = useMemo(
    () => optimisticBlackouts.find((entry) => entry.id === editingId) ?? null,
    [editingId, optimisticBlackouts],
  );

  const rows = useMemo<WorkshopBlackoutRow[]>(
    () =>
      optimisticBlackouts.map((entry) => ({
        id: entry.id,
        fromLabel: formatDateTime(entry.starts_at),
        toLabel: formatDateTime(entry.ends_at),
        reasonLabel: entry.reason ?? "—",
      })),
    [optimisticBlackouts],
  );

  const {
    execute: saveBlackout,
    isPending: isSaving,
    pending: pendingSave,
  } = useOptimisticAction({
    patch: (save: BlackoutSave) =>
      patchBlackouts({ kind: "save", blackout: save.blackout }),
    run: (save) =>
      save.id === null
        ? createBlackout({
            variables: { config_id: configId, input: save.input },
          })
        : updateBlackout({ variables: { id: save.id, input: save.input } }),
    refresh: refetch,
    messages: {
      success: "Closed spell saved",
      failure: "The closed spell could not be saved",
    },
    onSuccess: () => {
      setEditingId(null);
      setIsAdding(false);
    },
  });

  const handleSubmit = useCallback(
    (values: WorkshopBlackoutFormValues) => {
      const input = {
        starts_at: fromDateTimeLocal(values.starts_at, timezone),
        ends_at: fromDateTimeLocal(values.ends_at, timezone),
        reason: values.reason || null,
      };
      saveBlackout({
        id: editing?.id ?? null,
        input,
        blackout: {
          id: editing?.id ?? 0,
          config_id: configId,
          starts_at: input.starts_at,
          ends_at: input.ends_at,
          reason: input.reason,
        },
      });
    },
    [configId, editing, saveBlackout, timezone],
  );

  const {
    execute: removeBlackout,
    isPending: isDeleting,
    pending: pendingRemove,
  } = useOptimisticAction({
    patch: (blackout: WorkshopBlackoutData) =>
      patchBlackouts({ kind: "remove", blackout }),
    run: (blackout) => deleteBlackout({ variables: { id: blackout.id } }),
    refresh: refetch,
    messages: {
      success: "Closed spell removed",
      failure: "The closed spell could not be removed",
    },
    onSuccess: () => setDeletingId(null),
  });

  const handleDelete = useCallback(() => {
    const blackout = optimisticBlackouts.find((row) => row.id === deletingId);
    if (blackout) removeBlackout(blackout);
  }, [deletingId, optimisticBlackouts, removeBlackout]);

  const busyId = pendingSave?.blackout.id ?? pendingRemove?.id ?? null;
  const isPending = isSaving || isDeleting;

  return (
    <>
      <WorkshopBlackoutsTable
        rows={rows}
        isBusy={isPending}
        busyId={busyId}
        onAdd={() => setIsAdding(true)}
        onEdit={setEditingId}
        onDelete={setDeletingId}
      />
      <WorkshopBlackoutDialog
        // A fresh form each time the dialog opens on a different spell.
        key={`blackout-${editing?.id ?? "new"}`}
        isOpen={isAdding || editing !== null}
        isEditing={editing !== null}
        startsAt={editing ? toDateTimeLocal(editing.starts_at, timezone) : ""}
        endsAt={editing ? toDateTimeLocal(editing.ends_at, timezone) : ""}
        reason={editing?.reason ?? ""}
        timezoneLabel={timezone}
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
        title="Reopen this stretch?"
        description="People will be able to book the wheel during it again."
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
