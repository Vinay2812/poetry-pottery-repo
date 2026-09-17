"use client";

import Link from "next/link";
import { useCallback, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  UploadPurpose,
  useAdminContentPageQuery,
  useSaveContentPageMutation,
  type AdminContentPageFieldsFragment,
} from "@/graphql/generated/graphql";

import type { ContentPageFormValues } from "@/lib/validations/admin/content";

import { toErrorMessage } from "@/features/admin/shell";
import { AdminPageHeader, AdminStatusPill } from "@/features/admin/ui";
import { ImageUploaderContainer } from "@/features/admin/uploads";

import { ContentPageForm } from "../components/ContentPageForm";
import {
  describeSaved,
  emptyPageValues,
  isMissingPage,
  publishLabel,
  publishTone,
  toContentPageInput,
  toPageFormValues,
} from "../types";

type Page = AdminContentPageFieldsFragment;

interface PagePatch {
  title: string;
  is_published: boolean;
}

function mergePage(current: Page | null, patch: PagePatch): Page | null {
  return current === null ? null : { ...current, ...patch };
}

export interface ContentPageEditorContainerProps {
  slug: string;
}

export function ContentPageEditorContainer({
  slug,
}: ContentPageEditorContainerProps) {
  const { data, loading, error } = useAdminContentPageQuery({
    variables: { slug },
    fetchPolicy: "cache-and-network",
  });
  const [savePage] = useSaveContentPageMutation();
  const [, startTransition] = useTransition();
  // The mutation returns the saved page, so the payload becomes the baseline.
  const [saved, setSaved] = useState<Page | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [heroDraft, setHeroDraft] = useState<string | null | undefined>(
    undefined,
  );

  const loaded = saved ?? data?.adminContentPage ?? null;
  const [page, applyPatch] = useOptimistic(loaded, mergePage);

  const heroUrl =
    heroDraft === undefined ? (page?.hero_image_url ?? null) : heroDraft;

  const handleSubmit = useCallback(
    (values: ContentPageFormValues) => {
      const hero = heroUrl !== null && heroUrl.length > 0 ? heroUrl : null;
      setIsSaving(true);
      startTransition(async () => {
        applyPatch({ title: values.title, is_published: values.is_published });
        try {
          const result = await savePage({
            variables: { slug, input: toContentPageInput(values, hero) },
          });
          if (result.data) setSaved(result.data.saveContentPage);
          toast.success("Page saved");
        } catch (saveError) {
          toast.error(toErrorMessage(saveError));
        } finally {
          setIsSaving(false);
        }
      });
    },
    [applyPatch, heroUrl, savePage, slug],
  );

  const isMissing =
    page === null && error !== undefined && isMissingPage(error.message);

  if (page === null && loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-20 animate-pulse bg-ash" />
        <div className="h-96 animate-pulse bg-ash" />
      </div>
    );
  }

  if (page === null && error !== undefined && !isMissing) {
    return <p className="text-[13px]">{error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Content"
        title={page?.title.length ? page.title : `/${slug}`}
        description={`/${slug}`}
        actions={
          <div className="flex items-center gap-3">
            <AdminStatusPill
              label={publishLabel(page?.is_published ?? false)}
              tone={publishTone(page?.is_published ?? false)}
            />
            <Link
              href="/dashboard/content"
              className="text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              All pages
            </Link>
          </div>
        }
      />
      {isMissing && (
        <p className="text-[13px] text-muted-foreground">
          This page does not exist yet. Saving creates it.
        </p>
      )}
      <ContentPageForm
        key={slug}
        defaultValues={page ? toPageFormValues(page) : emptyPageValues()}
        savedLabel={describeSaved(page?.updated_at ?? null)}
        isSaving={isSaving}
        heroField={
          <ImageUploaderContainer
            id="page-hero-image"
            label="Hero image"
            purpose={UploadPurpose.Content}
            value={heroUrl}
            onChange={setHeroDraft}
          />
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}
