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
  useAdminContactMessagesQuery,
  useDeleteContactMessageMutation,
  useSetContactMessageReadMutation,
} from "@/graphql/generated/graphql";

import {
  toErrorMessage,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import { AdminConfirmDialog, AdminPagination } from "@/features/admin/ui";

import { ContactMessagesTable } from "@/features/admin/inbox/components/ContactMessagesTable";
import { MessagesFilters } from "@/features/admin/inbox/components/MessagesFilters";
import {
  applyContactPatch,
  toContactFilter,
  toContactRow,
} from "@/features/admin/inbox/types";

export function ContactMessagesContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const filter = useMemo(() => toContactFilter(values, page), [values, page]);
  const { data, previousData, loading, error, refetch } =
    useAdminContactMessagesQuery({
      variables: { filter },
      fetchPolicy: "cache-and-network",
    });
  const [setMessageRead] = useSetContactMessageReadMutation();
  const [deleteMessage] = useDeleteContactMessageMutation();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

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

  const handleToggleRead = useCallback(
    (id: number, isRead: boolean) => {
      setBusyId(id);
      startTransition(async () => {
        patchRows({ kind: "read", id, isRead });
        try {
          await setMessageRead({ variables: { id, is_read: isRead } });
          await refetch();
        } catch (readError) {
          toast.error(toErrorMessage(readError));
        } finally {
          setBusyId(null);
        }
      });
    },
    [patchRows, refetch, setMessageRead],
  );

  const handleConfirmDelete = useCallback(() => {
    const id = pendingDeleteId;
    if (id === null) return;
    setBusyId(id);
    startTransition(async () => {
      patchRows({ kind: "remove", id });
      try {
        await deleteMessage({ variables: { id } });
        await refetch();
        setPendingDeleteId(null);
        toast.success("Message deleted");
      } catch (deleteError) {
        toast.error(toErrorMessage(deleteError));
      } finally {
        setBusyId(null);
      }
    });
  }, [deleteMessage, patchRows, pendingDeleteId, refetch]);

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
        {error ? toErrorMessage(error) : "Messages could not be loaded."}
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
