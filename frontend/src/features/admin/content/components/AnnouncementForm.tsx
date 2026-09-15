"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";

import {
  announcementSchema,
  type AnnouncementFormValues,
} from "@/lib/validations/admin/content";

import { ContentTextField } from "./ContentTextField";

export interface AnnouncementFormProps {
  defaultValues: AnnouncementFormValues;
  isSaving: boolean;
  onSubmit: (values: AnnouncementFormValues) => void;
}

export function AnnouncementForm({
  defaultValues,
  isSaving,
  onSubmit,
}: AnnouncementFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues,
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ContentTextField
          id="announcement-text"
          label="Text"
          hint="Empty text takes the bar down."
          error={errors.text?.message}
          isMultiline={false}
          registration={register("text")}
        />
        <ContentTextField
          id="announcement-href"
          label="Link"
          hint="A path like /events, or a full URL. Optional."
          error={errors.href?.message}
          isMultiline={false}
          registration={register("href")}
        />
      </div>
      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save bar"}
        </Button>
      </div>
    </form>
  );
}
