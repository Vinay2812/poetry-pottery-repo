"use client";

import { useCallback, useMemo } from "react";

import { useQuery } from "@apollo/client/react";
import { AdminWhatsAppMessagesDocument } from "@/graphql/generated/graphql";

import {
  toErrorMessage,
  useAdminQueryState,
  useSearchDraft,
} from "@/features/admin/shell";
import { AdminPagination } from "@/features/admin/ui";

import { WhatsAppFilters } from "@/features/admin/inbox/components/WhatsAppFilters";
import { WhatsAppMessagesTable } from "@/features/admin/inbox/components/WhatsAppMessagesTable";
import { toWhatsAppFilter, toWhatsAppRow } from "@/features/admin/inbox/types";

export function WhatsAppMessagesContainer() {
  const { values, page, isPending, patch } = useAdminQueryState();
  const filter = useMemo(() => toWhatsAppFilter(values, page), [values, page]);
  const { data, previousData, loading, error } = useQuery(
    AdminWhatsAppMessagesDocument,
    {
      variables: { filter },
      fetchPolicy: "cache-and-network",
    },
  );

  const result =
    data?.adminWhatsAppMessages ?? previousData?.adminWhatsAppMessages;
  const rows = useMemo(
    () => (result?.items ?? []).map(toWhatsAppRow),
    [result],
  );

  const handleSearchCommit = useCallback(
    (value: string) => {
      patch({ whatsapp_search: value || null });
    },
    [patch],
  );
  const [searchDraft, handleSearchChange] = useSearchDraft(
    values.whatsapp_search ?? "",
    handleSearchCommit,
  );

  const handleDirectionChange = useCallback(
    (value: string) => {
      patch({ direction: value || null });
    },
    [patch],
  );

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
          ? toErrorMessage(error)
          : "WhatsApp messages could not be loaded."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <WhatsAppFilters
        search={searchDraft}
        direction={values.direction ?? ""}
        onSearchChange={handleSearchChange}
        onDirectionChange={handleDirectionChange}
      />
      <WhatsAppMessagesTable rows={rows} isBusy={loading || isPending} />
      <AdminPagination
        page={result.page_info.page}
        limit={result.page_info.limit}
        total={result.page_info.total}
        hasMore={result.page_info.has_more}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
