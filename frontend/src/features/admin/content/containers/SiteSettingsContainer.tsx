"use client";

import { useCallback, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  type AdminAnnouncementInput,
  AdminSiteSettingsDocument,
  type AdminSiteSettingsFieldsFragment,
  UpdateAnnouncementDocument,
  UpdateSiteSettingsDocument,
  UploadPurpose,
} from "@/graphql/generated/graphql";

import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type {
  AnnouncementFormValues,
  SiteSettingsFormValues,
} from "@/lib/validations/admin/content";

import { ImageUploaderContainer } from "@/features/admin/uploads";

import { AnnouncementForm } from "../components/AnnouncementForm";
import { ContentPanel } from "../components/ContentPanel";
import { SiteSettingsForm } from "../components/SiteSettingsForm";
import {
  describeSaved,
  toAnnouncementFormValues,
  toAnnouncementInput,
  toSettingsFormValues,
  toSettingsInput,
  toSettingsPatch,
} from "../types";

type Settings = AdminSiteSettingsFieldsFragment;

interface SettingsSave {
  values: SiteSettingsFormValues;
  hero: string | null;
}

function mergeSettings(
  current: Settings | null,
  patch: Partial<Settings>,
): Settings | null {
  return current === null ? null : { ...current, ...patch };
}

export function SiteSettingsContainer() {
  const { data, previousData, loading } = useQuery(AdminSiteSettingsDocument, {
    fetchPolicy: "cache-and-network",
  });
  const [updateSettings] = useMutation(UpdateSiteSettingsDocument);
  const [updateAnnouncement] = useMutation(UpdateAnnouncementDocument);
  // The mutations return the whole settings row, so the payload becomes the baseline.
  const [saved, setSaved] = useState<Settings | null>(null);
  const [heroDraft, setHeroDraft] = useState<string | null | undefined>(
    undefined,
  );

  const loaded = data?.siteSettings ?? previousData?.siteSettings ?? null;
  const [settings, applyPatch] = useOptimistic(saved ?? loaded, mergeSettings);

  const heroUrl =
    heroDraft === undefined ? (settings?.hero_image_url ?? null) : heroDraft;

  const { execute: saveSettings, isPending: isSavingSettings } =
    useOptimisticAction({
      patch: ({ values, hero }: SettingsSave) =>
        applyPatch(toSettingsPatch(values, hero)),
      run: ({ values, hero }) =>
        updateSettings({ variables: { input: toSettingsInput(values, hero) } }),
      messages: {
        success: "Settings saved",
        failure: "The settings could not be saved",
      },
      onSuccess: (result) => {
        if (result.data) setSaved(result.data.updateSiteSettings);
      },
    });

  const handleSettingsSubmit = useCallback(
    (values: SiteSettingsFormValues) => {
      const hero = heroUrl !== null && heroUrl.length > 0 ? heroUrl : null;
      saveSettings({ values, hero });
    },
    [heroUrl, saveSettings],
  );

  const { execute: saveAnnouncement, isPending: isSavingBar } =
    useOptimisticAction({
      patch: (input: AdminAnnouncementInput) =>
        applyPatch({
          announcement_text: input.text ?? null,
          announcement_href: input.href ?? null,
        }),
      run: (input) => updateAnnouncement({ variables: { input } }),
      messages: {
        success: (input) =>
          input.text === null
            ? "Announcement bar cleared"
            : "Announcement saved",
        failure: "The announcement could not be saved",
      },
      onSuccess: (result) => {
        if (result.data) setSaved(result.data.updateAnnouncement);
      },
    });

  const handleAnnouncementSubmit = useCallback(
    (values: AnnouncementFormValues) =>
      saveAnnouncement(toAnnouncementInput(values)),
    [saveAnnouncement],
  );

  if (!settings) {
    return loading ? (
      <div aria-busy="true" className="h-64 animate-pulse bg-ash" />
    ) : (
      <p className="text-[13px]">The site settings could not be loaded.</p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <ContentPanel
        title="Site settings"
        description="Contact details, links, shipping and the home hero."
        note={describeSaved(settings.updated_at)}
      >
        <SiteSettingsForm
          defaultValues={toSettingsFormValues(settings)}
          isSaving={isSavingSettings}
          heroField={
            <ImageUploaderContainer
              id="settings-hero-image"
              label="Hero image"
              purpose={UploadPurpose.Hero}
              value={heroUrl}
              onChange={setHeroDraft}
            />
          }
          onSubmit={handleSettingsSubmit}
        />
      </ContentPanel>

      <ContentPanel
        title="Announcement bar"
        description="One line across the top of every page."
        note={null}
      >
        <AnnouncementForm
          defaultValues={toAnnouncementFormValues(settings)}
          isSaving={isSavingBar}
          onSubmit={handleAnnouncementSubmit}
        />
      </ContentPanel>
    </div>
  );
}
