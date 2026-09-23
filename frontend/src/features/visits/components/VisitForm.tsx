"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPTY_VISIT_FORM,
  MAX_VISIT_NOTE,
  visitSchema,
  type VisitFormValues,
} from "@/lib/validations/visit";

interface FieldProps {
  id: string;
  label: string;
  autoComplete: string;
  error: string | undefined;
  registration: UseFormRegisterReturn;
}

function TextField({
  id,
  label,
  autoComplete,
  error,
  registration,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        {...registration}
      />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export interface VisitFormProps {
  pickedLabel: string | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: VisitFormValues) => void;
}

export function VisitForm({
  pickedLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
}: VisitFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: EMPTY_VISIT_FORM,
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 border-t border-ash pt-6"
    >
      {/* The line holds its height before a window is picked, so the fields never jump. */}
      <p className="min-h-5 text-[15px]">
        {pickedLabel ? `You are coming by ${pickedLabel}.` : null}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="visit-name"
          label="Your name"
          autoComplete="name"
          error={errors.name?.message}
          registration={register("name")}
        />
        <TextField
          id="visit-phone"
          label="Phone"
          autoComplete="tel"
          error={errors.phone?.message}
          registration={register("phone")}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="visit-note">Anything we should know (optional)</Label>
        <Textarea
          id="visit-note"
          rows={3}
          maxLength={MAX_VISIT_NOTE}
          aria-invalid={Boolean(errors.note)}
          {...register("note")}
        />
        {errors.note?.message && (
          <p role="alert" className="text-xs text-destructive">
            {errors.note.message}
          </p>
        )}
      </div>
      <p role="alert" className="min-h-4 text-[13px] text-destructive">
        {errorMessage}
      </p>
      <Button
        type="submit"
        className="w-fit"
        disabled={isSubmitting || pickedLabel === null}
      >
        {isSubmitting ? "Booking…" : "Book the visit"}
      </Button>
    </form>
  );
}
