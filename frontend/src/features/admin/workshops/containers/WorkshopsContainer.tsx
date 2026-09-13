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
  UploadPurpose,
  useAdminWorkshopConfigsQuery,
  useUpdateWorkshopConfigMutation,
} from "@/graphql/generated/graphql";

import type { WorkshopConfigFormValues } from "@/lib/validations/admin/workshop";

import { toErrorMessage, useAdminQueryState } from "@/features/admin/shell";
import { AdminPageHeader } from "@/features/admin/ui";
import { ImageUploaderContainer } from "@/features/admin/uploads";

import { WorkshopConfigForm } from "@/features/admin/workshops/components/WorkshopConfigForm";
import { WorkshopConfigPicker } from "@/features/admin/workshops/components/WorkshopConfigPicker";
import { WorkshopBlackoutsContainer } from "@/features/admin/workshops/containers/WorkshopBlackoutsContainer";
import { WorkshopBookingsContainer } from "@/features/admin/workshops/containers/WorkshopBookingsContainer";
import { WorkshopTiersContainer } from "@/features/admin/workshops/containers/WorkshopTiersContainer";
import {
  applyConfigPatch,
  describeClosedDays,
  minutesToTimeInput,
  timeInputToMinutes,
} from "@/features/admin/workshops/types";

interface PickedImage {
  configId: number;
  url: string | null;
}

export function WorkshopsContainer() {
  const { values, patch } = useAdminQueryState();
  const { data, previousData, loading, refetch } = useAdminWorkshopConfigsQuery(
    { fetchPolicy: "cache-and-network" },
  );
  const [updateConfig] = useUpdateWorkshopConfigMutation();

  const configs = useMemo(
    () =>
      data?.adminWorkshopConfigs ?? previousData?.adminWorkshopConfigs ?? [],
    [data, previousData],
  );
  const [optimisticConfigs, patchConfigs] = useOptimistic(
    configs,
    applyConfigPatch,
  );
  const [isSaving, startTransition] = useTransition();
  // The picked image is held against its studio so switching studios drops it.
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);

  const selected = useMemo(() => {
    const wanted = optimisticConfigs.find(
      (config) => String(config.id) === values.config,
    );
    return wanted ?? optimisticConfigs[0] ?? null;
  }, [optimisticConfigs, values.config]);

  const options = useMemo(
    () =>
      optimisticConfigs.map((config) => ({
        value: String(config.id),
        label: config.name,
      })),
    [optimisticConfigs],
  );

  const currentImage =
    pickedImage && pickedImage.configId === selected?.id
      ? pickedImage.url
      : (selected?.image_url ?? null);

  const handleSubmit = useCallback(
    (formValues: WorkshopConfigFormValues) => {
      if (!selected) return;
      const input = {
        name: formValues.name,
        description: formValues.description || null,
        image_url: currentImage,
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
      const id = selected.id;
      startTransition(async () => {
        patchConfigs({ id, changes: input });
        try {
          await updateConfig({ variables: { id, input } });
          toast.success("Settings saved");
        } catch (error) {
          toast.error(toErrorMessage(error));
        }
      });
    },
    [currentImage, patchConfigs, selected, updateConfig],
  );

  if (!selected) {
    return loading ? (
      <div aria-busy="true" className="flex flex-col gap-3">
        <div className="h-20 animate-pulse bg-ash" />
        <div className="h-64 animate-pulse bg-ash" />
      </div>
    ) : (
      <p className="text-[13px]">No workshop is set up yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader
        eyebrow="Studio"
        title="Workshops"
        description={describeClosedDays(selected.closed_weekdays)}
        actions={
          <WorkshopConfigPicker
            options={options}
            value={String(selected.id)}
            onChange={(value) => patch({ config: value })}
          />
        }
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
      <WorkshopBlackoutsContainer
        configId={selected.id}
        timezone={selected.timezone}
      />
      <WorkshopBookingsContainer
        configId={selected.id}
        timezone={selected.timezone}
      />
    </div>
  );
}
