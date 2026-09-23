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
  AdminWorkshopBlackoutsDocument,
  CreateWorkshopBlackoutDocument,
  DeleteWorkshopBlackoutDocument,
  UpdateWorkshopBlackoutDocument,
} from "@/graphql/generated/graphql";

import { formatDateTime } from "@/lib/format";
import type { WorkshopBlackoutFormValues } from "@/lib/validations/admin/workshop";

import { toErrorMessage } from "@/features/admin/shell";
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
} from "@/features/admin/workshops/types";

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
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

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

  const handleSubmit = useCallback(
    (values: WorkshopBlackoutFormValues) => {
      const id = editing?.id ?? 0;
      const input = {
        starts_at: fromDateTimeLocal(values.starts_at, timezone),
        ends_at: fromDateTimeLocal(values.ends_at, timezone),
        reason: values.reason || null,
      };
      setBusyId(id);
      startTransition(async () => {
        patchBlackouts({
          kind: "save",
          blackout: { id, config_id: configId, ...input },
        });
        try {
          if (editing) {
            await updateBlackout({ variables: { id: editing.id, input } });
          } else {
            await createBlackout({ variables: { config_id: configId, input } });
          }
          await refetch();
          setEditingId(null);
          setIsAdding(false);
          toast.success("Closed spell saved");
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setBusyId(null);
        }
      });
    },
    [
      configId,
      createBlackout,
      editing,
      patchBlackouts,
      refetch,
      timezone,
      updateBlackout,
    ],
  );

  const handleDelete = useCallback(() => {
    const blackout = optimisticBlackouts.find((row) => row.id === deletingId);
    if (!blackout) return;
    setBusyId(blackout.id);
    startTransition(async () => {
      patchBlackouts({ kind: "remove", blackout });
      try {
        await deleteBlackout({ variables: { id: blackout.id } });
        await refetch();
        setDeletingId(null);
        toast.success("Closed spell removed");
      } catch (error) {
        toast.error(toErrorMessage(error));
      } finally {
        setBusyId(null);
      }
    });
  }, [
    deletingId,
    deleteBlackout,
    optimisticBlackouts,
    patchBlackouts,
    refetch,
  ]);

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
