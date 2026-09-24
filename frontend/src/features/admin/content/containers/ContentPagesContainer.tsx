"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminContentPagesDocument,
  DeleteContentPageDocument,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";
import { contentSlugSchema } from "@/lib/validations/admin/content";

import { AdminConfirmDialog, AdminPageHeader } from "@/features/admin/ui";
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
  const { data, previousData, loading, refetch } = useQuery(
    AdminContentPagesDocument,
    {
      fetchPolicy: "cache-and-network",
    },
  );
  const [deletePage] = useMutation(DeleteContentPageDocument);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);

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
    setSlugError(null);
    router.push(`/dashboard/content/${parsed.data}`);
  }, [newSlug, router]);

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
              setSlugError(null);
              setIsNewOpen(true);
            }}
          >
            New page
          </Button>
        }
      />
      <ContentPagesTable
        rows={optimisticRows}
        isBusy={loading && pages === undefined}
        busySlug={busySlug}
        onDelete={setPendingSlug}
      />
      <NewPageDialog
        isOpen={isNewOpen}
        slug={newSlug}
        error={slugError}
        onSlugChange={(value) => {
          setNewSlug(value);
          setSlugError(null);
        }}
        onSubmit={handleCreate}
        onOpenChange={setIsNewOpen}
      />
      <AdminConfirmDialog
        isOpen={pendingSlug !== null}
        title="Delete this page"
        description={`/${pendingSlug ?? ""} will stop working on the site. This cannot be undone.`}
        confirmLabel="Delete page"
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
