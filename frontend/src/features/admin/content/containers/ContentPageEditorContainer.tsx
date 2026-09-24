"use client";

import Link from "next/link";
import { useCallback, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminContentPageDocument,
  type AdminContentPageFieldsFragment,
  SaveContentPageDocument,
  UploadPurpose,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type { ContentPageFormValues } from "@/lib/validations/admin/content";

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

interface PageSave {
  values: ContentPageFormValues;
  hero: string | null;
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
  const { data, loading, error } = useQuery(AdminContentPageDocument, {
    variables: { slug },
    fetchPolicy: "cache-and-network",
  });
  const [savePage] = useMutation(SaveContentPageDocument);
  // The mutation returns the saved page, so the payload becomes the baseline.
  const [saved, setSaved] = useState<Page | null>(null);
  const [heroDraft, setHeroDraft] = useState<string | null | undefined>(
    undefined,
  );

  const loaded = saved ?? data?.adminContentPage ?? null;
  const [page, applyPatch] = useOptimistic(loaded, mergePage);

  const heroUrl =
    heroDraft === undefined ? (page?.hero_image_url ?? null) : heroDraft;

  const { execute: save, isPending: isSaving } = useOptimisticAction({
    patch: ({ values }: PageSave) =>
      applyPatch({ title: values.title, is_published: values.is_published }),
    run: ({ values, hero }) =>
      savePage({
        variables: { slug, input: toContentPageInput(values, hero) },
      }),
    messages: { success: "Page saved", failure: "The page could not be saved" },
    onSuccess: (result) => {
      if (result.data) setSaved(result.data.saveContentPage);
    },
  });

  const handleSubmit = useCallback(
    (values: ContentPageFormValues) => {
      const hero = heroUrl !== null && heroUrl.length > 0 ? heroUrl : null;
      save({ values, hero });
    },
    [heroUrl, save],
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
