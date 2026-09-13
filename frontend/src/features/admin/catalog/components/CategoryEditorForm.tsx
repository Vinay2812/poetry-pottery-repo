"use client";

import type { ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  type AdminCategoryFormValues,
  adminCategorySchema,
} from "@/lib/validations/admin/catalog";

import { AdminField } from "@/features/admin/ui";

import { EMPTY_CATEGORY_FORM } from "@/features/admin/catalog/types";

export interface CategoryEditorFormProps {
  idPrefix: string;
  defaultValues?: AdminCategoryFormValues;
  isSaving: boolean;
  submitLabel: string;
  imageField: ReactNode;
  onSubmit: (values: AdminCategoryFormValues) => void;
  onCancel: () => void;
}

export function CategoryEditorForm({
  idPrefix,
  defaultValues,
  isSaving,
  submitLabel,
  imageField,
  onSubmit,
  onCancel,
}: CategoryEditorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminCategoryFormValues>({
    resolver: zodResolver(adminCategorySchema),
    defaultValues: defaultValues ?? EMPTY_CATEGORY_FORM,
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 md:grid-cols-3">
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
          id={`${idPrefix}-icon`}
          label="Icon"
          hint="The drawn icon the storefront uses, by name."
          error={errors.icon?.message}
        >
          <Input
            id={`${idPrefix}-icon`}
            className="h-9 text-[13px]"
            aria-invalid={Boolean(errors.icon)}
            {...register("icon")}
          />
        </AdminField>
        <AdminField
          id={`${idPrefix}-sort-order`}
          label="Sort order"
          hint="Lower numbers sit first on the shelf."
          error={errors.sort_order?.message}
        >
          <Input
            id={`${idPrefix}-sort-order`}
            inputMode="numeric"
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.sort_order)}
            {...register("sort_order")}
          />
        </AdminField>
      </div>
      {imageField}
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
