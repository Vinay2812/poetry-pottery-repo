"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type UseFormRegisterReturn,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type CommissionFormValues,
  commissionSchema,
  EMPTY_COMMISSION_FORM,
  MAX_CARVED_WORDS,
} from "@/lib/validations/commission";

interface FieldProps {
  id: string;
  label: string;
  autoComplete: string;
  error: string | undefined;
  registration: UseFormRegisterReturn;
  listId?: string;
}

function TextField({
  id,
  label,
  autoComplete,
  error,
  registration,
  listId,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        list={listId}
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

export interface CommissionBriefFormProps {
  pieceTypes: string[];
  sizes: string[];
  glazes: string[];
  isSubmitting: boolean;
  errorMessage: string | null;
  photoPicker?: React.ReactNode;
  // Pure: turns whatever has been typed so far into a WhatsApp link, or null with no number.
  toAskUrl: (values: CommissionFormValues) => string | null;
  onSubmit: (values: CommissionFormValues) => void;
}

export function CommissionBriefForm({
  pieceTypes,
  sizes,
  glazes,
  isSubmitting,
  errorMessage,
  photoPicker,
  toAskUrl,
  onSubmit,
}: CommissionBriefFormProps) {
  const pieceListId = useId();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionSchema),
    defaultValues: EMPTY_COMMISSION_FORM,
  });
  // The WhatsApp line carries whatever is typed so far, so it follows the fields live.
  const values = useWatch({ control, defaultValue: EMPTY_COMMISSION_FORM });
  const draft = { ...EMPTY_COMMISSION_FORM, ...values };
  const carvedLength = draft.carvedWords.length;
  const askUrl = toAskUrl(draft);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          The piece
        </h3>
        <TextField
          id="commission-piece"
          label="What should we make?"
          autoComplete="off"
          listId={pieceListId}
          error={errors.pieceType?.message}
          registration={register("pieceType")}
        />
        <datalist id={pieceListId}>
          {pieceTypes.map((pieceType) => (
            <option key={pieceType} value={pieceType} />
          ))}
        </datalist>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="commission-size">Size</Label>
            <Controller
              control={control}
              name="size"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="commission-size"
                    className="w-full"
                    aria-invalid={Boolean(errors.size)}
                  >
                    <SelectValue placeholder="Pick a size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.size?.message && (
              <p role="alert" className="text-xs text-destructive">
                {errors.size.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="commission-glaze">Glaze</Label>
            <Controller
              control={control}
              name="glaze"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="commission-glaze"
                    className="w-full"
                    aria-invalid={Boolean(errors.glaze)}
                  >
                    <SelectValue placeholder="Pick a glaze" />
                  </SelectTrigger>
                  <SelectContent>
                    {glazes.map((glaze) => (
                      <SelectItem key={glaze} value={glaze}>
                        {glaze}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.glaze?.message && (
              <p role="alert" className="text-xs text-destructive">
                {errors.glaze.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="commission-words">Words to carve (optional)</Label>
          <Input
            id="commission-words"
            maxLength={MAX_CARVED_WORDS}
            autoComplete="off"
            aria-invalid={Boolean(errors.carvedWords)}
            aria-describedby="commission-words-count"
            {...register("carvedWords")}
          />
          <p
            id="commission-words-count"
            className="text-[13px] text-muted-foreground tnum"
          >
            {carvedLength} of {MAX_CARVED_WORDS} characters
          </p>
          {errors.carvedWords?.message && (
            <p role="alert" className="text-xs text-destructive">
              {errors.carvedWords.message}
            </p>
          )}
        </div>

        {photoPicker}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="commission-notes">Anything else (optional)</Label>
          <Textarea
            id="commission-notes"
            rows={4}
            aria-invalid={Boolean(errors.notes)}
            {...register("notes")}
          />
          {errors.notes?.message && (
            <p role="alert" className="text-xs text-destructive">
              {errors.notes.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-ash pt-6">
        <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Where to send the sketch
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            id="commission-name"
            label="Your name"
            autoComplete="name"
            error={errors.name?.message}
            registration={register("name")}
          />
          <TextField
            id="commission-email"
            label="Email"
            autoComplete="email"
            error={errors.email?.message}
            registration={register("email")}
          />
        </div>
        <TextField
          id="commission-phone"
          label="Phone (optional)"
          autoComplete="tel"
          error={errors.phone?.message}
          registration={register("phone")}
        />
      </div>

      {/* The line keeps its height either way, so nothing below it jumps. */}
      <p role="alert" className="min-h-4 text-[13px] text-destructive">
        {errorMessage}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" className="w-fit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send the brief"}
        </Button>
        {askUrl && (
          <a
            href={askUrl}
            target="_blank"
            rel="noreferrer"
            className="border-b border-ink pb-0.5 text-sm hover:border-primary hover:text-primary"
          >
            Send it on WhatsApp instead
          </a>
        )}
      </div>
    </form>
  );
}
