"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EventLevel, EventType } from "@/graphql/generated/graphql";

import {
  type EventFormValues,
  eventSchema,
} from "@/lib/validations/admin/event";

import { AdminField, enumOptions } from "@/features/admin/ui";

import { isWorkshop } from "@/features/admin/events/types";

const TYPE_OPTIONS = enumOptions(EventType);
const LEVEL_OPTIONS = enumOptions(EventLevel);

const SELECT_CLASS =
  "h-9 w-full border border-ash bg-transparent px-2 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

export interface EventFormProps {
  defaultValues: EventFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  renderCoverField: (
    value: string,
    onChange: (url: string | null) => void,
  ) => ReactNode;
  renderGalleryField: (
    urls: string[],
    onChange: (urls: string[]) => void,
  ) => ReactNode;
  onSubmit: (values: EventFormValues) => void;
}

export function EventForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  renderCoverField,
  renderGalleryField,
  onSubmit,
}: EventFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
  });

  const eventType = useWatch({ control, name: "event_type" });
  const imageUrl = useWatch({ control, name: "image_url" });
  const gallery = useWatch({ control, name: "gallery" });
  const isWorkshopForm = isWorkshop(eventType);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 border border-ash p-4 md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id="event-title"
          label="Title"
          hint={null}
          error={errors.title?.message}
        >
          <Input
            id="event-title"
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />
        </AdminField>
        <AdminField
          id="event-type"
          label="Type"
          hint={null}
          error={errors.event_type?.message}
        >
          <select
            id="event-type"
            className={SELECT_CLASS}
            {...register("event_type")}
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </AdminField>
      </div>

      <AdminField
        id="event-description"
        label="Description"
        hint="Three sentences at most."
        error={errors.description?.message}
      >
        <Textarea
          id="event-description"
          rows={4}
          className="text-[13px]"
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
      </AdminField>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id="event-starts-at"
          label="Starts"
          hint="Studio time."
          error={errors.starts_at?.message}
        >
          <Input
            id="event-starts-at"
            type="datetime-local"
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.starts_at)}
            {...register("starts_at")}
          />
        </AdminField>
        <AdminField
          id="event-ends-at"
          label="Ends"
          hint="Studio time."
          error={errors.ends_at?.message}
        >
          <Input
            id="event-ends-at"
            type="datetime-local"
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.ends_at)}
            {...register("ends_at")}
          />
        </AdminField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id="event-location"
          label="Location"
          hint="The short name on the card."
          error={errors.location?.message}
        >
          <Input
            id="event-location"
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.location)}
            {...register("location")}
          />
        </AdminField>
        <AdminField
          id="event-address"
          label="Address"
          hint={null}
          error={errors.address?.message}
        >
          <Input
            id="event-address"
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.address)}
            {...register("address")}
          />
        </AdminField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id="event-price"
          label="Price"
          hint="Whole rupees. Zero for a free evening."
          error={errors.price?.message}
        >
          <Input
            id="event-price"
            type="number"
            min={0}
            step={1}
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.price)}
            {...register("price", { valueAsNumber: true })}
          />
        </AdminField>
        <AdminField
          id="event-total-seats"
          label="Total seats"
          hint={null}
          error={errors.total_seats?.message}
        >
          <Input
            id="event-total-seats"
            type="number"
            min={1}
            step={1}
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.total_seats)}
            {...register("total_seats", { valueAsNumber: true })}
          />
        </AdminField>
      </div>

      {isWorkshopForm ? (
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField
            id="event-level"
            label="Level"
            hint={null}
            error={errors.level?.message}
          >
            <select
              id="event-level"
              className={SELECT_CLASS}
              {...register("level")}
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField
            id="event-instructor"
            label="Instructor"
            hint={null}
            error={errors.instructor?.message}
          >
            <Input
              id="event-instructor"
              className="h-9 text-[13px]"
              aria-invalid={Boolean(errors.instructor)}
              {...register("instructor")}
            />
          </AdminField>
        </div>
      ) : (
        <AdminField
          id="event-performers"
          label="Performers"
          hint="One name per line."
          error={errors.performers?.message}
        >
          <Textarea
            id="event-performers"
            rows={4}
            className="text-[13px]"
            {...register("performers")}
          />
        </AdminField>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id="event-highlights"
          label="Highlights"
          hint="One per line."
          error={errors.highlights?.message}
        >
          <Textarea
            id="event-highlights"
            rows={4}
            className="text-[13px]"
            {...register("highlights")}
          />
        </AdminField>
        <AdminField
          id="event-includes"
          label="Includes"
          hint="One per line."
          error={errors.includes?.message}
        >
          <Textarea
            id="event-includes"
            rows={4}
            className="text-[13px]"
            {...register("includes")}
          />
        </AdminField>
      </div>

      {/* The uploaders label their own file inputs, so they sit outside AdminField. */}
      <div className="flex flex-col gap-1.5">
        {renderCoverField(imageUrl, (url) =>
          setValue("image_url", url ?? "", {
            shouldDirty: true,
            shouldValidate: true,
          }),
        )}
        {errors.image_url?.message && (
          <p role="alert" className="text-[12px] text-destructive">
            {errors.image_url.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {renderGalleryField(gallery, (urls) =>
          setValue("gallery", urls, { shouldDirty: true }),
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
