"use client";

import {
  useCallback,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  type AdminOptionGroupFieldsFragment,
  OptionGroupKind,
  useAdminProductOptionGroupsQuery,
  useCreateProductOptionGroupMutation,
  useCreateProductOptionMutation,
  useDeleteProductOptionGroupMutation,
  useDeleteProductOptionMutation,
  useUpdateProductOptionGroupMutation,
  useUpdateProductOptionMutation,
} from "@/graphql/generated/graphql";

import type {
  OptionGroupFormValues,
  ProductOptionFormValues,
} from "@/lib/validations/admin/product";

import { toErrorMessage } from "@/features/admin/shell";
import { AdminConfirmDialog } from "@/features/admin/ui";

import { OptionForm } from "@/features/admin/pieces/components/OptionForm";
import { OptionGroupForm } from "@/features/admin/pieces/components/OptionGroupForm";
import {
  type OptionGroupRow,
  OptionGroupList,
} from "@/features/admin/pieces/components/OptionGroupList";
import {
  describeMaxLength,
  describeOptionGroup,
  EMPTY_OPTION_FORM,
  EMPTY_OPTION_GROUP_FORM,
  formatPriceModifier,
  formatSortOrder,
  sortOptionGroups,
  toOptionGroupFormValues,
  toOptionGroupInput,
  toOptionInput,
} from "@/features/admin/pieces/types";

type Editor =
  | { kind: "none" }
  | { kind: "new-group" }
  | { kind: "edit-group"; groupId: number }
  | { kind: "new-option"; groupId: number }
  | { kind: "edit-option"; groupId: number; optionId: number };

type Doomed =
  | { kind: "group"; groupId: number; name: string }
  | { kind: "option"; optionId: number; name: string };

type GroupPatch =
  | { kind: "remove-group"; groupId: number }
  | { kind: "remove-option"; optionId: number };

function applyGroupPatch(
  groups: AdminOptionGroupFieldsFragment[],
  patch: GroupPatch,
): AdminOptionGroupFieldsFragment[] {
  if (patch.kind === "remove-group") {
    return groups.filter((group) => group.id !== patch.groupId);
  }
  return groups.map((group) => ({
    ...group,
    options: group.options.filter((option) => option.id !== patch.optionId),
  }));
}

export interface OptionGroupsContainerProps {
  productId: number;
}

export function OptionGroupsContainer({
  productId,
}: OptionGroupsContainerProps) {
  const { data, previousData, refetch } = useAdminProductOptionGroupsQuery({
    variables: { product_id: productId },
    fetchPolicy: "cache-and-network",
  });

  const [createGroup] = useCreateProductOptionGroupMutation();
  const [updateGroup] = useUpdateProductOptionGroupMutation();
  const [deleteGroup] = useDeleteProductOptionGroupMutation();
  const [createOption] = useCreateProductOptionMutation();
  const [updateOption] = useUpdateProductOptionMutation();
  const [deleteOption] = useDeleteProductOptionMutation();

  const [editor, setEditor] = useState<Editor>({ kind: "none" });
  const [doomed, setDoomed] = useState<Doomed | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [, startTransition] = useTransition();

  const groups = useMemo(
    () =>
      sortOptionGroups(
        data?.adminProductOptionGroups ??
          previousData?.adminProductOptionGroups ??
          [],
      ),
    [data, previousData],
  );

  const [optimisticGroups, patchGroups] = useOptimistic(
    groups,
    applyGroupPatch,
  );

  const rows = useMemo<OptionGroupRow[]>(
    () =>
      optimisticGroups.map((group) => ({
        id: group.id,
        name: group.name,
        summary: describeOptionGroup(
          group.kind,
          group.options.length,
          group.is_required,
        ),
        priceLabel: formatPriceModifier(group.price_modifier),
        isChoice: group.kind === OptionGroupKind.Choice,
        lengthLabel:
          group.kind === OptionGroupKind.Text
            ? describeMaxLength(group.max_length)
            : null,
        options: [...group.options]
          .sort(
            (left, right) =>
              left.sort_order - right.sort_order || left.id - right.id,
          )
          .map((option) => ({
            id: option.id,
            name: option.name,
            priceLabel: formatPriceModifier(option.price_modifier),
            sortLabel: formatSortOrder(option.sort_order),
            isActive: option.is_active,
          })),
      })),
    [optimisticGroups],
  );

  const findGroup = useCallback(
    (groupId: number) => groups.find((group) => group.id === groupId) ?? null,
    [groups],
  );

  const handleGroupSubmit = useCallback(
    (values: OptionGroupFormValues) => {
      const input = toOptionGroupInput(values);
      const editing = editor.kind === "edit-group" ? editor.groupId : null;
      setIsSaving(true);
      void (async () => {
        try {
          if (editing === null) {
            await createGroup({ variables: { product_id: productId, input } });
          } else {
            await updateGroup({ variables: { id: editing, input } });
          }
          await refetch();
          setEditor({ kind: "none" });
          toast.success(editing === null ? "Group added" : "Group saved");
        } catch (caught) {
          toast.error(toErrorMessage(caught));
        } finally {
          setIsSaving(false);
        }
      })();
    },
    [createGroup, editor, productId, refetch, updateGroup],
  );

  const handleOptionSubmit = useCallback(
    (values: ProductOptionFormValues) => {
      if (editor.kind !== "new-option" && editor.kind !== "edit-option") return;
      const input = toOptionInput(values);
      const current = editor;
      setIsSaving(true);
      void (async () => {
        try {
          if (current.kind === "new-option") {
            await createOption({
              variables: { group_id: current.groupId, input },
            });
          } else {
            await updateOption({ variables: { id: current.optionId, input } });
          }
          await refetch();
          setEditor({ kind: "none" });
          toast.success(
            current.kind === "new-option" ? "Option added" : "Option saved",
          );
        } catch (caught) {
          toast.error(toErrorMessage(caught));
        } finally {
          setIsSaving(false);
        }
      })();
    },
    [createOption, editor, refetch, updateOption],
  );

  const handleDelete = useCallback(() => {
    if (!doomed) return;
    const target = doomed;
    setDoomed(null);
    setBusyId(target.kind === "group" ? target.groupId : null);
    startTransition(async () => {
      patchGroups(
        target.kind === "group"
          ? { kind: "remove-group", groupId: target.groupId }
          : { kind: "remove-option", optionId: target.optionId },
      );
      try {
        if (target.kind === "group") {
          await deleteGroup({ variables: { id: target.groupId } });
        } else {
          await deleteOption({ variables: { id: target.optionId } });
        }
        await refetch();
        setEditor({ kind: "none" });
      } catch (caught) {
        toast.error(toErrorMessage(caught));
      } finally {
        setBusyId(null);
      }
    });
  }, [deleteGroup, deleteOption, doomed, patchGroups, refetch]);

  const editingGroup =
    editor.kind === "edit-group" ? findGroup(editor.groupId) : null;
  const editingOption =
    editor.kind === "edit-option"
      ? (findGroup(editor.groupId)?.options.find(
          (option) => option.id === editor.optionId,
        ) ?? null)
      : null;

  const isGroupFormOpen =
    editor.kind === "new-group" ||
    (editor.kind === "edit-group" && editingGroup !== null);
  const isOptionFormOpen =
    editor.kind === "new-option" ||
    (editor.kind === "edit-option" && editingOption !== null);

  return (
    <section className="flex flex-col gap-4 border-t border-ash pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl leading-none tracking-tight">
            Options
          </h2>
          <p className="text-[13px] text-muted-foreground">
            What a buyer can choose or write on this piece.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setEditor({ kind: "new-group" })}
        >
          Add group
        </Button>
      </div>

      {isGroupFormOpen && (
        <OptionGroupForm
          key={editor.kind === "edit-group" ? editor.groupId : "new-group"}
          title={editingGroup ? "Edit group" : "New group"}
          defaultValues={
            editingGroup
              ? toOptionGroupFormValues(editingGroup)
              : EMPTY_OPTION_GROUP_FORM
          }
          isSubmitting={isSaving}
          submitLabel={editingGroup ? "Save group" : "Add group"}
          onSubmit={handleGroupSubmit}
          onCancel={() => setEditor({ kind: "none" })}
        />
      )}

      {isOptionFormOpen && (
        <OptionForm
          key={editor.kind === "edit-option" ? editor.optionId : "new-option"}
          title={editingOption ? "Edit option" : "New option"}
          defaultValues={
            editingOption
              ? {
                  name: editingOption.name,
                  price_modifier: editingOption.price_modifier,
                  sort_order: editingOption.sort_order,
                  is_active: editingOption.is_active,
                }
              : EMPTY_OPTION_FORM
          }
          isSubmitting={isSaving}
          submitLabel={editingOption ? "Save option" : "Add option"}
          onSubmit={handleOptionSubmit}
          onCancel={() => setEditor({ kind: "none" })}
        />
      )}

      <OptionGroupList
        groups={rows}
        busyId={busyId}
        onEditGroup={(groupId) => setEditor({ kind: "edit-group", groupId })}
        onDeleteGroup={(groupId) =>
          setDoomed({
            kind: "group",
            groupId,
            name: findGroup(groupId)?.name ?? "this group",
          })
        }
        onAddOption={(groupId) => setEditor({ kind: "new-option", groupId })}
        onEditOption={(groupId, optionId) =>
          setEditor({ kind: "edit-option", groupId, optionId })
        }
        onDeleteOption={(groupId, optionId) =>
          setDoomed({
            kind: "option",
            optionId,
            name:
              findGroup(groupId)?.options.find(
                (option) => option.id === optionId,
              )?.name ?? "this option",
          })
        }
      />

      <AdminConfirmDialog
        isOpen={doomed !== null}
        title={
          doomed?.kind === "group"
            ? "Delete this group?"
            : "Delete this option?"
        }
        description={`${doomed?.name ?? "It"} goes away for good.`}
        confirmLabel="Delete"
        isDestructive
        isBusy={busyId !== null}
        onConfirm={handleDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDoomed(null);
        }}
      />
    </section>
  );
}
