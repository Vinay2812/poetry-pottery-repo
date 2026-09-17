"use client";

import type { ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  type StudioNoteFormValues,
  studioNoteSchema,
} from "@/lib/validations/admin/order";

import { AdminField } from "@/features/admin/ui";

export interface StudioNoteFormProps {
  isSending: boolean;
  photoField: ReactNode;
  onSubmit: (values: StudioNoteFormValues) => void;
}

/** Whatever is written here is mailed to the customer the moment it is sent. */
export function StudioNoteForm({
  isSending,
  photoField,
  onSubmit,
}: StudioNoteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudioNoteFormValues>({
    resolver: zodResolver(studioNoteSchema),
    defaultValues: { body: "" },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <AdminField
        id="studio-note-body"
        label="Add a note from the studio"
        hint="This goes out as an email to the customer straight away."
        error={errors.body?.message}
      >
        <Textarea
          id="studio-note-body"
          rows={4}
          placeholder="Out of the glaze firing this morning…"
          aria-invalid={Boolean(errors.body)}
          {...register("body")}
        />
      </AdminField>
      {photoField}
      <div>
        <Button type="submit" size="sm" disabled={isSending}>
          {isSending ? "Sending…" : "Send note"}
        </Button>
      </div>
    </form>
  );
}
