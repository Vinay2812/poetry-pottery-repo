"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";
import { toast } from "sonner";

import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import {
  AdminNewsletterSubscribersDocument,
  ExportNewsletterSubscribersDocument,
  UnsubscribeSubscriberDocument,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { useOptimisticAction } from "@/lib/use-optimistic-action";

import { useAdminQueryState, useSearchDraft } from "@/features/admin/shell";
import { AdminConfirmDialog, AdminPagination } from "@/features/admin/ui";

import { SubscribersFilters } from "@/features/admin/inbox/components/SubscribersFilters";
import { SubscribersTable } from "@/features/admin/inbox/components/SubscribersTable";
import {
  applySubscriberPatch,
  toSubscriberRow,
  toSubscribersCsvName,
  toSubscribersExportFilter,
  toSubscribersFilter,
} from "@/features/admin/inbox/types";
import { downloadCsv } from "@/lib/download";

export function SubscribersContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const filter = useMemo(
    () => toSubscribersFilter(values, page),
    [values, page],
  );
  const { data, previousData, loading, error, refetch } = useQuery(
    AdminNewsletterSubscribersDocument,
    {
      variables: { filter },
      fetchPolicy: "cache-and-network",
    },
  );
  const [unsubscribe] = useMutation(UnsubscribeSubscriberDocument);
  const [exportSubscribers] = useLazyQuery(
    ExportNewsletterSubscribersDocument,
    {
      fetchPolicy: "network-only",
    },
  );
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const result =
    data?.adminNewsletterSubscribers ??
    previousData?.adminNewsletterSubscribers;
  const rows = useMemo(
    () => (result?.items ?? []).map(toSubscriberRow),
    [result],
  );
  const [optimisticRows, patchRows] = useOptimistic(rows, applySubscriberPatch);

  const handleSearchCommit = useCallback(
    (value: string) => {
      patch({ subscriber_search: value || null });
    },
    [patch],
  );
  const [searchDraft, handleSearchChange] = useSearchDraft(
    values.subscriber_search ?? "",
    handleSearchCommit,
  );

  const { execute: removeSubscriber, pending: busyEmail } = useOptimisticAction(
    {
      patch: (email: string) => patchRows({ email }),
      run: (email) => unsubscribe({ variables: { email } }),
      refresh: refetch,
      messages: {
        success: "Taken off the list",
        failure: "That address could not be unsubscribed",
      },
      onSuccess: () => setPendingEmail(null),
    },
  );

  const handleConfirmUnsubscribe = useCallback(() => {
    if (pendingEmail !== null) removeSubscriber(pendingEmail);
  }, [pendingEmail, removeSubscriber]);

  const handleUnsubscribeRequest = useCallback((email: string) => {
    setPendingEmail(email);
  }, []);

  const handleUnsubscribeOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) setPendingEmail(null);
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const exported = await exportSubscribers({
        variables: { filter: toSubscribersExportFilter(values) },
      });
      if (exported.error) throw exported.error;
      const csv = exported.data?.exportNewsletterSubscribers;
      if (csv === undefined) throw new Error("The export came back empty");
      downloadCsv(toSubscribersCsvName(new Date()), csv);
    } catch (exportError) {
      toast.error(describeError(exportError, "The export could not be made"));
    } finally {
      setIsExporting(false);
    }
  }, [exportSubscribers, values]);

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
          ? describeError(error, "Subscribers could not be loaded.")
          : "Subscribers could not be loaded."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <SubscribersFilters
        search={searchDraft}
        activeState={values.active ?? ""}
        isExporting={isExporting}
        onSearchChange={handleSearchChange}
        onActiveStateChange={(value) => patch({ active: value || null })}
        onExport={handleExport}
      />
      <SubscribersTable
        rows={optimisticRows}
        isBusy={loading || isPending}
        busyEmail={busyEmail}
        onUnsubscribe={handleUnsubscribeRequest}
      />
      <AdminPagination
        page={result.page_info.page}
        limit={result.page_info.limit}
        total={result.page_info.total}
        hasMore={result.page_info.has_more}
        onPageChange={handlePageChange}
      />
      <AdminConfirmDialog
        isOpen={pendingEmail !== null}
        title="Take this address off the list?"
        description={`${pendingEmail ?? ""} stops receiving the newsletter. They can sign up again themselves.`}
        confirmLabel="Unsubscribe"
        isDestructive
        isBusy={busyEmail !== null && busyEmail === pendingEmail}
        onConfirm={handleConfirmUnsubscribe}
        onOpenChange={handleUnsubscribeOpenChange}
      />
    </div>
  );
}
