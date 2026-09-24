"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminContactMessagesDocument,
  DeleteContactMessageDocument,
  SetContactMessageReadDocument,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { useOptimisticAction } from "@/lib/use-optimistic-action";

import { useAdminQueryState, useSearchDraft } from "@/features/admin/shell";
import { AdminConfirmDialog, AdminPagination } from "@/features/admin/ui";

import { ContactMessagesTable } from "@/features/admin/inbox/components/ContactMessagesTable";
import { MessagesFilters } from "@/features/admin/inbox/components/MessagesFilters";
import {
  applyContactPatch,
  toContactFilter,
  toContactRow,
} from "@/features/admin/inbox/types";

interface ReadToggle {
  id: number;
  isRead: boolean;
}

export function ContactMessagesContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const filter = useMemo(() => toContactFilter(values, page), [values, page]);
  const { data, previousData, loading, error, refetch } = useQuery(
    AdminContactMessagesDocument,
    {
      variables: { filter },
      fetchPolicy: "cache-and-network",
    },
  );
  const [setMessageRead] = useMutation(SetContactMessageReadDocument);
  const [deleteMessage] = useMutation(DeleteContactMessageDocument);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const result =
    data?.adminContactMessages ?? previousData?.adminContactMessages;
  const rows = useMemo(() => (result?.items ?? []).map(toContactRow), [result]);
  const [optimisticRows, patchRows] = useOptimistic(rows, applyContactPatch);

  const handleSearchCommit = useCallback(
    (value: string) => {
      patch({ search: value || null });
    },
    [patch],
  );
  const [searchDraft, handleSearchChange] = useSearchDraft(
    values.search ?? "",
    handleSearchCommit,
  );

  const { execute: toggleRead, pending: pendingRead } = useOptimisticAction({
    patch: ({ id, isRead }: ReadToggle) =>
      patchRows({ kind: "read", id, isRead }),
    run: ({ id, isRead }) =>
      setMessageRead({ variables: { id, is_read: isRead } }),
    refresh: refetch,
    messages: { success: null, failure: "The message could not be updated" },
  });

  const handleToggleRead = useCallback(
    (id: number, isRead: boolean) => toggleRead({ id, isRead }),
    [toggleRead],
  );

  const { execute: removeMessage, pending: pendingRemove } =
    useOptimisticAction({
      patch: (id: number) => patchRows({ kind: "remove", id }),
      run: (id) => deleteMessage({ variables: { id } }),
      refresh: refetch,
      messages: {
        success: "Message deleted",
        failure: "The message could not be deleted",
      },
      onSuccess: () => setPendingDeleteId(null),
    });

  const handleConfirmDelete = useCallback(() => {
    if (pendingDeleteId !== null) removeMessage(pendingDeleteId);
  }, [pendingDeleteId, removeMessage]);

  const busyId = pendingRead?.id ?? pendingRemove ?? null;

  const handleDeleteOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setPendingDeleteId(null);
  }, []);

  const handleDeleteRequest = useCallback((id: number) => {
    setPendingDeleteId(id);
  }, []);

  const handlePageChange = useCallback(
    (next: number) => {
      patch({ page: String(next) });
    },
    [patch],
  );

  if (!result && loading) {
    return <div aria-busy="true" className="h-96 animate-pulse bg-ash" />;
  }

  if (!result) {
    return (
      <p className="text-[13px]">
        {error
          ? describeError(error, "Messages could not be loaded.")
          : "Messages could not be loaded."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <MessagesFilters
        search={searchDraft}
        readState={values.read ?? ""}
        onSearchChange={handleSearchChange}
        onReadStateChange={(value) => patch({ read: value || null })}
      />
      <ContactMessagesTable
        rows={optimisticRows}
        isBusy={loading || isPending}
        busyId={busyId}
        onToggleRead={handleToggleRead}
        onDelete={handleDeleteRequest}
      />
      <AdminPagination
        page={result.page_info.page}
        limit={result.page_info.limit}
        total={result.page_info.total}
        hasMore={result.page_info.has_more}
        onPageChange={handlePageChange}
      />
      <AdminConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete this message?"
        description="It leaves the inbox for good. This cannot be undone."
        confirmLabel="Delete message"
        isDestructive
        isBusy={busyId !== null && busyId === pendingDeleteId}
        onConfirm={handleConfirmDelete}
        onOpenChange={handleDeleteOpenChange}
      />
    </div>
  );
}
