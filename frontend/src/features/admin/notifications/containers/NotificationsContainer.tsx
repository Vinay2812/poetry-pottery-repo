"use client";

import { useCallback, useMemo, useState } from "react";

import { toast } from "sonner";

import {
  useAdminBatchNotificationsQuery,
  useExportBatchNotificationsLazyQuery,
} from "@/graphql/generated/graphql";

import { Button } from "@/components/ui/button";

import {
  toErrorMessage,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import {
  AdminPageHeader,
  AdminPagination,
  AdminSearchField,
  AdminSelectFilter,
  AdminToolbar,
} from "@/features/admin/ui";

import { WatchersTable } from "@/features/admin/notifications/components/WatchersTable";
import {
  toNotificationsExportFilter,
  toNotificationsFilter,
  toWatcherRow,
  toWatchersCsvName,
  type WatcherRow,
} from "@/features/admin/notifications/types";

const NOTIFIED_OPTIONS = [
  { value: "0", label: "Still waiting" },
  { value: "1", label: "Notified" },
];

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

export function NotificationsContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const search = values.search ?? "";
  const notifiedValue = values.notified ?? "";

  const filter = useMemo(
    () => toNotificationsFilter(values, page),
    [values, page],
  );

  const commitSearch = useCallback(
    (value: string) => patch({ search: value === "" ? null : value }),
    [patch],
  );
  const [searchDraft, setSearchDraft] = useSearchDraft(search, commitSearch);

  const { data, previousData, loading } = useAdminBatchNotificationsQuery({
    variables: { filter },
    fetchPolicy: "cache-and-network",
  });

  const [exportWatchers] = useExportBatchNotificationsLazyQuery({
    fetchPolicy: "network-only",
  });
  const [isExporting, setIsExporting] = useState(false);

  const result =
    data?.adminBatchNotifications ?? previousData?.adminBatchNotifications;

  const rows = useMemo<WatcherRow[]>(
    () => (result?.items ?? []).map(toWatcherRow),
    [result],
  );

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const exported = await exportWatchers({
        variables: { filter: toNotificationsExportFilter(values) },
      });
      if (exported.error) throw exported.error;
      const csv = exported.data?.exportBatchNotifications;
      if (csv === undefined) throw new Error("The export came back empty");
      downloadCsv(toWatchersCsvName(new Date()), csv);
    } catch (exportError) {
      toast.error(toErrorMessage(exportError));
    } finally {
      setIsExporting(false);
    }
  }, [exportWatchers, values]);

  const pageInfo = result?.page_info;
  const hasFilters = search !== "" || notifiedValue !== "";

  if (!result && loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-20 animate-pulse bg-ash" />
        <div className="h-64 animate-pulse bg-ash" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Studio"
        title="Waiting list"
        description="Who is waiting for a sold-out piece to come back."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isExporting}
            onClick={() => void handleExport()}
          >
            {isExporting ? "Exporting…" : "Export CSV"}
          </Button>
        }
      />

      <AdminToolbar>
        <AdminSearchField
          id="notifications-search"
          label="Search"
          placeholder="Email or piece"
          value={searchDraft}
          onChange={setSearchDraft}
        />
        <AdminSelectFilter
          id="notifications-notified"
          label="Notified"
          anyLabel="Anyone"
          options={NOTIFIED_OPTIONS}
          value={notifiedValue}
          onChange={(value) => patch({ notified: value === "" ? null : value })}
        />
      </AdminToolbar>

      <WatchersTable
        rows={rows}
        isBusy={isPending || (loading && result !== undefined)}
        emptyMessage={
          hasFilters ? "Nobody matches that search" : "Nobody is waiting yet"
        }
      />

      {pageInfo && (
        <AdminPagination
          page={pageInfo.page}
          limit={pageInfo.limit}
          total={pageInfo.total}
          hasMore={pageInfo.has_more}
          onPageChange={(next) => patch({ page: String(next) })}
        />
      )}
    </div>
  );
}
