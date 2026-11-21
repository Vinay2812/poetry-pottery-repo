"use client";

import { useCallback, useMemo, useOptimistic, useState } from "react";

import { useMutation, useQuery } from "@apollo/client/react";
import {
  AdminWorkshopConfigsDocument,
  UpdateWorkshopConfigDocument,
  UploadPurpose,
} from "@/graphql/generated/graphql";

import { describeError } from "@/lib/apollo/errors";
import { DEFAULT_TIME_ZONE, safeTimeZone } from "@/lib/timezones";
import { useOptimisticAction } from "@/lib/use-optimistic-action";
import type { WorkshopConfigFormValues } from "@/lib/validations/admin/workshop";

import { useAdminQueryState } from "@/features/admin/shell";
import {
  AdminLoadError,
  AdminPageHeader,
  retryQuery,
} from "@/features/admin/ui";
import { ImageUploaderContainer } from "@/features/admin/uploads";

import { WorkshopConfigForm } from "@/features/admin/workshops/components/WorkshopConfigForm";
import { WorkshopConfigPicker } from "@/features/admin/workshops/components/WorkshopConfigPicker";
import { WorkshopBlackoutsContainer } from "@/features/admin/workshops/containers/WorkshopBlackoutsContainer";
import { WorkshopBookingsContainer } from "@/features/admin/workshops/containers/WorkshopBookingsContainer";
import { WorkshopTiersContainer } from "@/features/admin/workshops/containers/WorkshopTiersContainer";
import {
  ALL_SETUPS,
  applyConfigPatch,
  describeClosedDays,
  minutesToTimeInput,
  readSetupChoice,
  timeInputToMinutes,
  toSetupOptions,
} from "@/features/admin/workshops/types";

interface PickedImage {
  configId: number;
  url: string | null;
}

function toConfigInput(
  formValues: WorkshopConfigFormValues,
  imageUrl: string | null,
) {
  return {
    name: formValues.name,
    description: formValues.description || null,
    image_url: imageUrl,
    is_active: formValues.is_active,
    timezone: formValues.timezone,
    opening_minutes: timeInputToMinutes(formValues.opening_time),
    closing_minutes: timeInputToMinutes(formValues.closing_time),
    slot_minutes: formValues.slot_minutes,
    capacity_per_slot: formValues.capacity_per_slot,
    booking_window_days: formValues.booking_window_days,
    slot_span_days: formValues.slot_span_days,
    closed_weekdays: formValues.closed_weekdays,
  };
}

interface ConfigSave {
  id: number;
  input: ReturnType<typeof toConfigInput>;
}

export function WorkshopsContainer() {
  const { values, patch } = useAdminQueryState();
  const { data, previousData, loading, error, refetch } = useQuery(
    AdminWorkshopConfigsDocument,
    { fetchPolicy: "cache-and-network" },
  );
  const [updateConfig] = useMutation(UpdateWorkshopConfigDocument);

  const configs = useMemo(
    () =>
      data?.adminWorkshopConfigs ?? previousData?.adminWorkshopConfigs ?? [],
    [data, previousData],
  );
  const [optimisticConfigs, patchConfigs] = useOptimistic(
    configs,
    applyConfigPatch,
  );
  // The picked image is held against its studio so switching studios drops it.
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);

  const choice = useMemo(
    () =>
      readSetupChoice(
        optimisticConfigs.map((config) => config.id),
        values.config,
      ),
    [optimisticConfigs, values.config],
  );
  const isAllSetups = choice?.kind === "all";
  // The whole queue still needs a setup for its date filter; the first one's zone stands in.
  const selected = useMemo(() => {
    if (!choice) return null;
    const wantedId = choice.kind === "one" ? choice.id : null;
    return (
      optimisticConfigs.find((config) => config.id === wantedId) ??
      optimisticConfigs[0] ??
      null
    );
  }, [choice, optimisticConfigs]);

  const options = useMemo(
    () => toSetupOptions(optimisticConfigs),
    [optimisticConfigs],
  );
  const setupTimezones = useMemo(
    () =>
      isAllSetups
        ? new Map(
            optimisticConfigs.map((config) => [
              config.id,
              safeTimeZone(config.timezone),
            ]),
          )
        : null,
    [isAllSetups, optimisticConfigs],
  );

  const currentImage =
    pickedImage && pickedImage.configId === selected?.id
      ? pickedImage.url
      : (selected?.image_url ?? null);

  // A stored zone Intl cannot read would throw inside every date helper below.
  const storedTimezone = selected?.timezone ?? DEFAULT_TIME_ZONE;
  const timezone = safeTimeZone(storedTimezone);
  const hasBrokenTimezone = timezone !== storedTimezone;

  // The payload carries the saved studio back, so there is nothing to refetch.
  const { execute: saveConfig, isPending: isSaving } = useOptimisticAction({
    patch: (save: ConfigSave) =>
      patchConfigs({ id: save.id, changes: save.input }),
    run: (save) =>
      updateConfig({ variables: { id: save.id, input: save.input } }),
    messages: {
      success: "Settings saved",
      failure: "The settings could not be saved",
    },
  });

  const handleSubmit = useCallback(
    (formValues: WorkshopConfigFormValues) => {
      if (!selected) return;
      saveConfig({
        id: selected.id,
        input: toConfigInput(formValues, currentImage),
      });
    },
    [currentImage, saveConfig, selected],
  );

  if (!selected) {
    if (error) {
      return (
        <div className="flex flex-col gap-8">
          <AdminPageHeader
            eyebrow="Studio"
            title="Wheel sessions"
            description={null}
          />
          <AdminLoadError
            message={describeError(
              error,
              "The wheel sessions could not be loaded.",
            )}
            isRetrying={loading}
            onRetry={retryQuery(refetch)}
          />
        </div>
      );
    }
    return loading ? (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-20 animate-pulse bg-ash" />
        <div className="h-64 animate-pulse bg-ash" />
      </div>
    ) : (
      <p className="text-[13px]">No wheel session is set up yet.</p>
    );
  }

  const picker = (
    <WorkshopConfigPicker
      options={options}
      value={isAllSetups ? ALL_SETUPS : String(selected.id)}
      onChange={(value) => patch({ config: value })}
    />
  );

  if (isAllSetups) {
    return (
      <div className="flex flex-col gap-10">
        <AdminPageHeader
          eyebrow="Studio"
          title="Wheel sessions"
          description="Requests across every setup. Pick one to change its settings, sessions or closed days."
          actions={picker}
        />
        <WorkshopBookingsContainer
          configId={null}
          timezone={timezone}
          setupTimezones={setupTimezones}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader
        eyebrow="Studio"
        title="Wheel sessions"
        description={describeClosedDays(selected.closed_weekdays)}
        actions={picker}
      />
      {hasBrokenTimezone && (
        <p role="alert" className="bg-ash px-3 py-2 text-[13px]">
          {storedTimezone} is not a timezone this browser knows, so times below
          are read in {timezone}. Pick a real zone and save to fix it.
        </p>
      )}
      {/* Requests are the daily work, so they come before the settings that rarely change. */}
      <WorkshopBookingsContainer
        configId={selected.id}
        timezone={timezone}
        setupTimezones={null}
      />
      <WorkshopConfigForm
        // Switching studios swaps every default, so the form starts over.
        key={selected.id}
        name={selected.name}
        description={selected.description ?? ""}
        isActive={selected.is_active}
        timezone={selected.timezone}
        openingTime={minutesToTimeInput(selected.opening_minutes)}
        closingTime={minutesToTimeInput(selected.closing_minutes)}
        slotMinutes={selected.slot_minutes}
        capacityPerSlot={selected.capacity_per_slot}
        bookingWindowDays={selected.booking_window_days}
        slotSpanDays={selected.slot_span_days}
        closedWeekdays={selected.closed_weekdays}
        isSubmitting={isSaving}
        imageField={
          <ImageUploaderContainer
            id="workshop-image"
            label="Intro image"
            hasPreview
            purpose={UploadPurpose.Hero}
            value={currentImage}
            onChange={(url) => setPickedImage({ configId: selected.id, url })}
          />
        }
        onSubmit={handleSubmit}
      />
      <WorkshopTiersContainer
        configId={selected.id}
        tiers={selected.tiers}
        onRefetch={refetch}
      />
      <WorkshopBlackoutsContainer configId={selected.id} timezone={timezone} />
    </div>
  );
}
