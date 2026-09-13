"use client";

import type { ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  type AdminCollectionFormValues,
  adminCollectionSchema,
} from "@/lib/validations/admin/catalog";

import { AdminField } from "@/features/admin/ui";

import { EMPTY_COLLECTION_FORM } from "@/features/admin/catalog/types";

export interface CollectionEditorFormProps {
  idPrefix: string;
  defaultValues?: AdminCollectionFormValues;
  isSaving: boolean;
  submitLabel: string;
  imageField: ReactNode;
  onSubmit: (values: AdminCollectionFormValues) => void;
  onCancel: () => void;
}

export function CollectionEditorForm({
  idPrefix,
  defaultValues,
  isSaving,
  submitLabel,
  imageField,
  onSubmit,
  onCancel,
}: CollectionEditorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminCollectionFormValues>({
    resolver: zodResolver(adminCollectionSchema),
    defaultValues: defaultValues ?? EMPTY_COLLECTION_FORM,
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
          id={`${idPrefix}-starts-at`}
          label="Starts"
          hint="Leave empty to keep it on the shelf from the start."
          error={errors.starts_at?.message}
        >
          <Input
            id={`${idPrefix}-starts-at`}
            type="datetime-local"
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.starts_at)}
            {...register("starts_at")}
          />
        </AdminField>
        <AdminField
          id={`${idPrefix}-ends-at`}
          label="Ends"
          hint="Leave empty to keep it on the shelf for good."
          error={errors.ends_at?.message}
        >
          <Input
            id={`${idPrefix}-ends-at`}
            type="datetime-local"
            className="h-9 text-[13px] tnum"
            aria-invalid={Boolean(errors.ends_at)}
            {...register("ends_at")}
          />
        </AdminField>
      </div>
      <AdminField
        id={`${idPrefix}-description`}
        label="Description"
        hint="One or two sentences, the same voice as the shop."
        error={errors.description?.message}
      >
        <Textarea
          id={`${idPrefix}-description`}
          rows={2}
          className="text-[13px]"
          aria-invalid={Boolean(errors.description)}
          {...register("description")}
        />
      </AdminField>
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
