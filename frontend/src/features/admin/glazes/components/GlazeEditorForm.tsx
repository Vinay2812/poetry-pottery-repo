"use client";

import type { ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  type AdminGlazeFormValues,
  adminGlazeSchema,
} from "@/lib/validations/admin/glaze";

import { AdminField, toPreviewColour } from "@/features/admin/ui";

import { EMPTY_GLAZE_FORM } from "@/features/admin/glazes/types";

export interface GlazeEditorFormProps {
  idPrefix: string;
  defaultValues?: AdminGlazeFormValues;
  isSaving: boolean;
  submitLabel: string;
  swatchField: ReactNode;
  onSubmit: (values: AdminGlazeFormValues) => void;
  onCancel: () => void;
}

export function GlazeEditorForm({
  idPrefix,
  defaultValues,
  isSaving,
  submitLabel,
  swatchField,
  onSubmit,
  onCancel,
}: GlazeEditorFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminGlazeFormValues>({
    resolver: zodResolver(adminGlazeSchema),
    defaultValues: defaultValues ?? EMPTY_GLAZE_FORM,
  });

  const swatchColour = toPreviewColour(
    useWatch({ control, name: "color_code" }),
  );

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id={`${idPrefix}-name`}
          label="Name"
          hint={null}
          error={errors.name?.message}
        >
          <Input
            id={`${idPrefix}-name`}
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </AdminField>
        <AdminField
          id={`${idPrefix}-color-code`}
          label="Colour"
          hint="A hex colour for the swatch, or leave it empty."
          error={errors.color_code?.message}
        >
          <div className="flex gap-2">
            <Input
              id={`${idPrefix}-color-code`}
              placeholder="#6F7D6B"
              className="h-9 text-[13px]"
              aria-invalid={Boolean(errors.color_code)}
              {...register("color_code")}
            />
            <span
              aria-hidden="true"
              className="aspect-square shrink-0 self-stretch border border-ash bg-white"
              style={
                swatchColour ? { backgroundColor: swatchColour } : undefined
              }
            />
          </div>
        </AdminField>
        <div className="md:col-span-2">
          <AdminField
            id={`${idPrefix}-description`}
            label="Description"
            hint="What it looks like in the hand."
            error={errors.description?.message}
          >
            <Textarea
              id={`${idPrefix}-description`}
              rows={3}
              className="text-[13px]"
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
          </AdminField>
        </div>
        <div className="md:col-span-2">
          <AdminField
            id={`${idPrefix}-variation-note`}
            label="Variation note"
            hint="What the kiln does differently to each piece."
            error={errors.variation_note?.message}
          >
            <Textarea
              id={`${idPrefix}-variation-note`}
              rows={2}
              className="text-[13px]"
              aria-invalid={Boolean(errors.variation_note)}
              {...register("variation_note")}
            />
          </AdminField>
        </div>
      </div>
      {swatchField}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Saving…" : submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isSaving}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
