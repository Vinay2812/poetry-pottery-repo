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
  useAdminNewsletterSubscribersQuery,
  useExportNewsletterSubscribersLazyQuery,
  useUnsubscribeSubscriberMutation,
} from "@/graphql/generated/graphql";

import { toErrorMessage, useAdminQueryState } from "@/features/admin/shell";
import { useSearchDraft } from "@/features/admin/shell/hooks";
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

function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function SubscribersContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const filter = useMemo(
    () => toSubscribersFilter(values, page),
    [values, page],
  );
  const { data, previousData, loading, error, refetch } =
    useAdminNewsletterSubscribersQuery({
      variables: { filter },
      fetchPolicy: "cache-and-network",
    });
  const [unsubscribe] = useUnsubscribeSubscriberMutation();
  const [exportSubscribers] = useExportNewsletterSubscribersLazyQuery({
    fetchPolicy: "network-only",
  });
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [, startTransition] = useTransition();

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

  const handleConfirmUnsubscribe = useCallback(() => {
    const email = pendingEmail;
    if (email === null) return;
    setBusyEmail(email);
    startTransition(async () => {
      patchRows({ email });
      try {
        await unsubscribe({ variables: { email } });
        await refetch();
        setPendingEmail(null);
        toast.success("Taken off the list");
      } catch (unsubscribeError) {
        toast.error(toErrorMessage(unsubscribeError));
      } finally {
        setBusyEmail(null);
      }
    });
  }, [patchRows, pendingEmail, refetch, unsubscribe]);

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
      toast.error(toErrorMessage(exportError));
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
        {error ? toErrorMessage(error) : "Subscribers could not be loaded."}
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
