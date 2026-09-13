"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import {
  type WorkshopConfigFormValues,
  workshopConfigSchema,
} from "@/lib/validations/admin/workshop";

import { AdminField } from "@/features/admin/ui";

import {
  describeClosedDays,
  toggleWeekday,
  WEEKDAY_LABELS,
} from "@/features/admin/workshops/types";

export interface WorkshopConfigFormProps {
  name: string;
  description: string;
  isActive: boolean;
  timezone: string;
  openingTime: string;
  closingTime: string;
  slotMinutes: number;
  capacityPerSlot: number;
  bookingWindowDays: number;
  slotSpanDays: number;
  closedWeekdays: number[];
  isSubmitting: boolean;
  imageField: ReactNode;
  onSubmit: (values: WorkshopConfigFormValues) => void;
}

export function WorkshopConfigForm({
  name,
  description,
  isActive,
  timezone,
  openingTime,
  closingTime,
  slotMinutes,
  capacityPerSlot,
  bookingWindowDays,
  slotSpanDays,
  closedWeekdays,
  isSubmitting,
  imageField,
  onSubmit,
}: WorkshopConfigFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WorkshopConfigFormValues>({
    resolver: zodResolver(workshopConfigSchema),
    defaultValues: {
      name,
      description,
      is_active: isActive,
      timezone,
      opening_time: openingTime,
      closing_time: closingTime,
      slot_minutes: slotMinutes,
      capacity_per_slot: capacityPerSlot,
      booking_window_days: bookingWindowDays,
      slot_span_days: slotSpanDays,
      closed_weekdays: closedWeekdays,
    },
  });
  const activeValue = useWatch({ control, name: "is_active" });
  const closedValue = useWatch({ control, name: "closed_weekdays" });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 border border-ash p-4 md:p-5"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id="workshop-name"
          label="Name"
          hint={null}
          error={errors.name?.message}
        >
          <Input
            id="workshop-name"
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </AdminField>
        <AdminField
          id="workshop-timezone"
          label="Timezone"
          hint="The clock every slot and blackout is read in"
          error={errors.timezone?.message}
        >
          <Input
            id="workshop-timezone"
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.timezone)}
            {...register("timezone")}
          />
        </AdminField>
      </div>

      <AdminField
        id="workshop-description"
        label="Description"
        hint="Shown above the booking calendar"
        error={errors.description?.message}
      >
        <Textarea
          id="workshop-description"
          className="text-[13px]"
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
      </AdminField>

      {imageField}

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id="workshop-opening"
          label="Doors open"
          hint={null}
          error={errors.opening_time?.message}
        >
          <Input
            id="workshop-opening"
            type="time"
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.opening_time)}
            {...register("opening_time")}
          />
        </AdminField>
        <AdminField
          id="workshop-closing"
          label="Doors close"
          hint={null}
          error={errors.closing_time?.message}
        >
          <Input
            id="workshop-closing"
            type="time"
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.closing_time)}
            {...register("closing_time")}
          />
        </AdminField>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminField
          id="workshop-slot-minutes"
          label="How long one slot runs"
          hint="Minutes"
          error={errors.slot_minutes?.message}
        >
          <Input
            id="workshop-slot-minutes"
            type="number"
            inputMode="numeric"
            min={1}
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.slot_minutes)}
            {...register("slot_minutes", { valueAsNumber: true })}
          />
        </AdminField>
        <AdminField
          id="workshop-capacity"
          label="How many wheels are free in a slot"
          hint="Wheels"
          error={errors.capacity_per_slot?.message}
        >
          <Input
            id="workshop-capacity"
            type="number"
            inputMode="numeric"
            min={1}
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.capacity_per_slot)}
            {...register("capacity_per_slot", { valueAsNumber: true })}
          />
        </AdminField>
        <AdminField
          id="workshop-window"
          label="How far ahead people can book"
          hint="Days"
          error={errors.booking_window_days?.message}
        >
          <Input
            id="workshop-window"
            type="number"
            inputMode="numeric"
            min={1}
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.booking_window_days)}
            {...register("booking_window_days", { valueAsNumber: true })}
          />
        </AdminField>
        <AdminField
          id="workshop-span"
          label="How many days a session may span"
          hint="Days"
          error={errors.slot_span_days?.message}
        >
          <Input
            id="workshop-span"
            type="number"
            inputMode="numeric"
            min={1}
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.slot_span_days)}
            {...register("slot_span_days", { valueAsNumber: true })}
          />
        </AdminField>
      </div>

      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Days the studio is closed
        </legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
          {WEEKDAY_LABELS.map((label, weekday) => (
            <Label
              key={label}
              htmlFor={`workshop-closed-${weekday}`}
              className="gap-2 text-[13px] font-normal"
            >
              <Checkbox
                id={`workshop-closed-${weekday}`}
                checked={closedValue.includes(weekday)}
                onCheckedChange={() =>
                  setValue(
                    "closed_weekdays",
                    toggleWeekday(closedValue, weekday),
                    { shouldDirty: true },
                  )
                }
              />
              {label}
            </Label>
          ))}
        </div>
        <p className="text-[12px] text-muted-foreground">
          {describeClosedDays(closedValue)}
        </p>
        {errors.closed_weekdays?.message && (
          <p role="alert" className="text-[12px] text-destructive">
            {errors.closed_weekdays.message}
          </p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ash pt-4">
        <Label
          htmlFor="workshop-active"
          className="gap-2.5 text-[13px] font-normal"
        >
          <Switch
            id="workshop-active"
            checked={activeValue}
            onCheckedChange={(checked) =>
              setValue("is_active", checked, { shouldDirty: true })
            }
          />
          {activeValue ? "Taking bookings" : "Closed to bookings"}
        </Label>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
