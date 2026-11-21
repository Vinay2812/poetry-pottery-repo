"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminContentPagesDocument,
  DeleteContentPageDocument,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { useOptimisticAction } from "@/lib/use-optimistic-action";
import { contentSlugSchema } from "@/lib/validations/admin/content";

import {
  AdminConfirmDialog,
  AdminLoadError,
  AdminPageHeader,
  retryQuery,
} from "@/features/admin/ui";
import { Button } from "@/components/ui/button";

import {
  ContentPagesTable,
  type ContentPageRow,
} from "../components/ContentPagesTable";
import { NewPageDialog } from "../components/NewPageDialog";
import { publishLabel, publishTone } from "../types";

function withoutSlug(rows: ContentPageRow[], slug: string): ContentPageRow[] {
  return rows.filter((row) => row.slug !== slug);
}

export function ContentPagesContainer() {
  const router = useRouter();
  const { data, previousData, loading, error, refetch } = useQuery(
    AdminContentPagesDocument,
    {
      fetchPolicy: "cache-and-network",
    },
  );
  const [deletePage] = useMutation(DeleteContentPageDocument);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [slugError, setSlugError] = useState<string | undefined>(undefined);

  const pages = data?.adminContentPages ?? previousData?.adminContentPages;

  const rows = useMemo<ContentPageRow[]>(
    () =>
      (pages ?? []).map((page) => ({
        slug: page.slug,
        title: page.title,
        statusLabel: publishLabel(page.is_published),
        statusTone: publishTone(page.is_published),
      })),
    [pages],
  );

  const [optimisticRows, dropRow] = useOptimistic(rows, withoutSlug);

  const { execute: removePage, pending: busySlug } = useOptimisticAction({
    patch: (slug: string) => dropRow(slug),
    run: (slug) => deletePage({ variables: { slug } }),
    refresh: refetch,
    messages: {
      success: (slug) => `/${slug} deleted`,
      failure: "The page could not be deleted",
    },
  });

  const handleDelete = useCallback(() => {
    if (pendingSlug === null) return;
    setPendingSlug(null);
    removePage(pendingSlug);
  }, [pendingSlug, removePage]);

  const handleCreate = useCallback(() => {
    const parsed = contentSlugSchema.safeParse(newSlug);
    if (!parsed.success) {
      setSlugError(parsed.error.issues[0]?.message ?? "That slug will not do");
      return;
    }
    setIsNewOpen(false);
    setNewSlug("");
    setSlugError(undefined);
    router.push(`/dashboard/content/${parsed.data}`);
  }, [newSlug, router]);

  // "No pages yet" only after the list has actually come back.
  const loadError =
    error && !data
      ? describeError(error, "The pages could not be loaded.")
      : null;

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        eyebrow="Studio"
        title="Content"
        description="The written pages, the site settings and the announcement bar."
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setSlugError(undefined);
              setIsNewOpen(true);
            }}
          >
            New page
          </Button>
        }
      />
      {loadError ? (
        <AdminLoadError
          message={loadError}
          isRetrying={loading}
          onRetry={retryQuery(refetch)}
        />
      ) : pages === undefined ? (
        <div aria-busy="true" className="h-64 animate-pulse bg-ash" />
      ) : (
        <ContentPagesTable
          rows={optimisticRows}
          isBusy={loading}
          busySlug={busySlug}
          onDelete={setPendingSlug}
        />
      )}
      <NewPageDialog
        isOpen={isNewOpen}
        slug={newSlug}
        error={slugError}
        onSlugChange={(value) => {
          setNewSlug(value);
          setSlugError(undefined);
        }}
        onSubmit={handleCreate}
        onOpenChange={setIsNewOpen}
      />
      <AdminConfirmDialog
        isOpen={pendingSlug !== null}
        title="Delete this page"
        description={`/${pendingSlug ?? ""} will stop working on the site. This cannot be undone.`}
        confirmLabel="Delete page"
        cancelLabel="Keep as is"
        isDestructive
        isBusy={busySlug !== null}
        onConfirm={handleDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPendingSlug(null);
        }}
      />
    </div>
  );
}
