"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  UploadPurpose,
  useAdminSiteSettingsQuery,
  useUpdateAnnouncementMutation,
  useUpdateSiteSettingsMutation,
  type AdminSiteSettingsFieldsFragment,
} from "@/graphql/generated/graphql";

import type {
  AnnouncementFormValues,
  SiteSettingsFormValues,
} from "@/lib/validations/admin/content";

import { toErrorMessage } from "@/features/admin/shell";
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

function mergeSettings(
  current: Settings | null,
  patch: Partial<Settings>,
): Settings | null {
  return current === null ? null : { ...current, ...patch };
}

export function SiteSettingsContainer() {
  const { data, previousData, loading } = useAdminSiteSettingsQuery({
    fetchPolicy: "cache-and-network",
  });
  const [updateSettings] = useUpdateSiteSettingsMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [, startTransition] = useTransition();
  // The mutations return the whole settings row, so the payload becomes the baseline.
  const [saved, setSaved] = useState<Settings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingBar, setIsSavingBar] = useState(false);
  const [heroDraft, setHeroDraft] = useState<string | null | undefined>(
    undefined,
  );

  const loaded = data?.siteSettings ?? previousData?.siteSettings ?? null;
  const [settings, applyPatch] = useOptimistic(saved ?? loaded, mergeSettings);

  const heroUrl =
    heroDraft === undefined ? (settings?.hero_image_url ?? null) : heroDraft;

  const handleSettingsSubmit = useCallback(
    (values: SiteSettingsFormValues) => {
      const hero = heroUrl !== null && heroUrl.length > 0 ? heroUrl : null;
      setIsSavingSettings(true);
      startTransition(async () => {
        applyPatch(toSettingsPatch(values, hero));
        try {
          const result = await updateSettings({
            variables: { input: toSettingsInput(values, hero) },
          });
          if (result.data) setSaved(result.data.updateSiteSettings);
          toast.success("Settings saved");
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setIsSavingSettings(false);
        }
      });
    },
    [applyPatch, heroUrl, updateSettings],
  );

  const handleAnnouncementSubmit = useCallback(
    (values: AnnouncementFormValues) => {
      const input = toAnnouncementInput(values);
      setIsSavingBar(true);
      startTransition(async () => {
        applyPatch({
          announcement_text: input.text ?? null,
          announcement_href: input.href ?? null,
        });
        try {
          const result = await updateAnnouncement({ variables: { input } });
          if (result.data) setSaved(result.data.updateAnnouncement);
          toast.success(
            input.text === null
              ? "Announcement bar cleared"
              : "Announcement saved",
          );
        } catch (error) {
          toast.error(toErrorMessage(error));
        } finally {
          setIsSavingBar(false);
        }
      });
    },
    [applyPatch, updateAnnouncement],
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
