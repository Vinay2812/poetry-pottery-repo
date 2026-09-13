"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type ContactFormValues,
  contactSchema,
  EMPTY_CONTACT_FORM,
} from "@/lib/validations/contact";

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

export interface ContactFormProps {
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: ContactFormValues) => void;
}

export function ContactForm({
  isSubmitting,
  errorMessage,
  onSubmit,
}: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY_CONTACT_FORM,
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="contact-name"
          label="Your name"
          autoComplete="name"
          error={errors.name?.message}
          registration={register("name")}
        />
        <TextField
          id="contact-email"
          label="Email"
          autoComplete="email"
          error={errors.email?.message}
          registration={register("email")}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="contact-phone"
          label="Phone (optional)"
          autoComplete="tel"
          error={errors.phone?.message}
          registration={register("phone")}
        />
        <TextField
          id="contact-subject"
          label="Subject (optional)"
          autoComplete="off"
          error={errors.subject?.message}
          registration={register("subject")}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={6}
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
        {errors.message?.message && (
          <p role="alert" className="text-xs text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>
      {errorMessage && (
        <p role="alert" className="text-[13px] text-destructive">
          {errorMessage}
        </p>
      )}
      <Button type="submit" className="w-fit" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
