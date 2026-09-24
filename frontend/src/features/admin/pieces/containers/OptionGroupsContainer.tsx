"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";

import { Button } from "@/components/ui/button";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  type AdminOptionGroupFieldsFragment,
  type AdminOptionGroupInput,
  type AdminOptionInput,
  AdminProductOptionGroupsDocument,
  CreateProductOptionDocument,
  CreateProductOptionGroupDocument,
  DeleteProductOptionDocument,
  DeleteProductOptionGroupDocument,
  OptionGroupKind,
  UpdateProductOptionDocument,
  UpdateProductOptionGroupDocument,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type {
  OptionGroupFormValues,
  ProductOptionFormValues,
} from "@/lib/validations/admin/product";

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

interface GroupSave {
  id: number | null;
  input: AdminOptionGroupInput;
}

interface OptionSave {
  groupId: number;
  optionId: number | null;
  input: AdminOptionInput;
}

export interface OptionGroupsContainerProps {
  productId: number;
}

export function OptionGroupsContainer({
  productId,
}: OptionGroupsContainerProps) {
  const { data, previousData, refetch } = useQuery(
    AdminProductOptionGroupsDocument,
    {
      variables: { product_id: productId },
      fetchPolicy: "cache-and-network",
    },
  );

  const [createGroup] = useMutation(CreateProductOptionGroupDocument);
  const [updateGroup] = useMutation(UpdateProductOptionGroupDocument);
  const [deleteGroup] = useMutation(DeleteProductOptionGroupDocument);
  const [createOption] = useMutation(CreateProductOptionDocument);
  const [updateOption] = useMutation(UpdateProductOptionDocument);
  const [deleteOption] = useMutation(DeleteProductOptionDocument);

  const [editor, setEditor] = useState<Editor>({ kind: "none" });
  const [doomed, setDoomed] = useState<Doomed | null>(null);

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

  const closeEditor = useCallback(() => setEditor({ kind: "none" }), []);

  const { execute: saveGroup, isPending: isGroupSaving } = useOptimisticAction({
    run: (save: GroupSave) =>
      save.id === null
        ? createGroup({
            variables: { product_id: productId, input: save.input },
          })
        : updateGroup({ variables: { id: save.id, input: save.input } }),
    refresh: refetch,
    messages: {
      success: (save) => (save.id === null ? "Group added" : "Group saved"),
      failure: "The group could not be saved",
    },
    onSuccess: closeEditor,
  });

  const handleGroupSubmit = useCallback(
    (values: OptionGroupFormValues) => {
      saveGroup({
        id: editor.kind === "edit-group" ? editor.groupId : null,
        input: toOptionGroupInput(values),
      });
    },
    [editor, saveGroup],
  );

  const { execute: saveOption, isPending: isOptionSaving } =
    useOptimisticAction({
      run: (save: OptionSave) =>
        save.optionId === null
          ? createOption({
              variables: { group_id: save.groupId, input: save.input },
            })
          : updateOption({
              variables: { id: save.optionId, input: save.input },
            }),
      refresh: refetch,
      messages: {
        success: (save) =>
          save.optionId === null ? "Option added" : "Option saved",
        failure: "The option could not be saved",
      },
      onSuccess: closeEditor,
    });

  const handleOptionSubmit = useCallback(
    (values: ProductOptionFormValues) => {
      if (editor.kind !== "new-option" && editor.kind !== "edit-option") return;
      saveOption({
        groupId: editor.groupId,
        optionId: editor.kind === "edit-option" ? editor.optionId : null,
        input: toOptionInput(values),
      });
    },
    [editor, saveOption],
  );

  const { execute: removeDoomed, pending: pendingRemove } = useOptimisticAction(
    {
      patch: (target: Doomed) =>
        patchGroups(
          target.kind === "group"
            ? { kind: "remove-group", groupId: target.groupId }
            : { kind: "remove-option", optionId: target.optionId },
        ),
      run: (target) =>
        target.kind === "group"
          ? deleteGroup({ variables: { id: target.groupId } })
          : deleteOption({ variables: { id: target.optionId } }),
      refresh: refetch,
      messages: {
        success: (target) =>
          target.kind === "group" ? "Group removed" : "Option removed",
        failure: "That could not be deleted",
      },
      onSuccess: closeEditor,
    },
  );

  const handleDelete = useCallback(() => {
    if (!doomed) return;
    setDoomed(null);
    removeDoomed(doomed);
  }, [doomed, removeDoomed]);

  const busyId = pendingRemove?.kind === "group" ? pendingRemove.groupId : null;
  const isSaving = isGroupSaving || isOptionSaving;

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
          onCancel={closeEditor}
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
          onCancel={closeEditor}
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
