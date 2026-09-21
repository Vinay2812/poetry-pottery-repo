"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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

import type { GlazeChoice, PieceChoice } from "@/features/commissions/types";
import { toSizesForPiece } from "@/features/commissions/types";
import { GlazeSwatch } from "@/features/products/components/GlazeSwatch";

// The last entry in the piece list; picking it opens a box to describe the piece instead.
const OTHER_PIECE = "__other__";

interface FieldProps {
  id: string;
  label: string;
  autoComplete: string;
  error: string | undefined;
  registration: UseFormRegisterReturn;
  placeholder?: string;
}

function TextField({
  id,
  label,
  autoComplete,
  error,
  registration,
  placeholder,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        autoComplete={autoComplete}
        placeholder={placeholder}
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
  pieces: PieceChoice[];
  glazes: GlazeChoice[];
  // Filled in ahead when the brief starts from a piece in the archive.
  initialValues?: Partial<CommissionFormValues>;
  referenceLine?: string | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  photoPicker?: React.ReactNode;
  // Pure: turns whatever has been typed so far into a WhatsApp link, or null with no number.
  toAskUrl: (values: CommissionFormValues) => string | null;
  onSubmit: (values: CommissionFormValues) => void;
}

export function CommissionBriefForm({
  pieces,
  glazes,
  initialValues,
  referenceLine = null,
  isSubmitting,
  errorMessage,
  photoPicker,
  toAskUrl,
  onSubmit,
}: CommissionBriefFormProps) {
  const [isOtherPiece, setIsOtherPiece] = useState(false);
  const defaultValues = { ...EMPTY_COMMISSION_FORM, ...initialValues };
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CommissionFormValues>({
    resolver: zodResolver(commissionSchema),
    defaultValues,
  });
  // The WhatsApp line carries whatever is typed so far, so it follows the fields live.
  const values = useWatch({ control, defaultValue: defaultValues });
  const draft = { ...EMPTY_COMMISSION_FORM, ...values };
  const carvedLength = draft.carvedWords.length;
  const askUrl = toAskUrl(draft);
  const isListedPiece = pieces.some((piece) => piece.name === draft.pieceType);
  const pieceChoice = isListedPiece
    ? draft.pieceType
    : isOtherPiece
      ? OTHER_PIECE
      : "";
  const sizes = toSizesForPiece(pieces, draft.pieceType);
  const hasPiece = draft.pieceType.length > 0 || isOtherPiece;

  // Sizes belong to a piece, so changing the piece clears the size chosen for the last one.
  const handlePieceChange = (
    value: string,
    onChange: (next: string) => void,
  ) => {
    setIsOtherPiece(value === OTHER_PIECE);
    onChange(value === OTHER_PIECE ? "" : value);
    setValue("size", "");
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4">
        {referenceLine && (
          <p className="border-l-2 border-primary pl-3 text-[15px]">
            {referenceLine}
          </p>
        )}
        <h3 className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          The piece
        </h3>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="commission-piece">What should we make?</Label>
          <Controller
            control={control}
            name="pieceType"
            render={({ field }) => (
              <Select
                value={pieceChoice}
                onValueChange={(value) =>
                  handlePieceChange(value, field.onChange)
                }
              >
                <SelectTrigger
                  id="commission-piece"
                  className="w-full"
                  aria-invalid={Boolean(errors.pieceType) && !isOtherPiece}
                >
                  <SelectValue placeholder="Pick a piece" />
                </SelectTrigger>
                <SelectContent>
                  {pieces.map((piece) => (
                    <SelectItem key={piece.name} value={piece.name}>
                      {piece.name}
                    </SelectItem>
                  ))}
                  <SelectItem value={OTHER_PIECE}>Something else</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.pieceType?.message && !isOtherPiece && (
            <p role="alert" className="text-xs text-destructive">
              {errors.pieceType.message}
            </p>
          )}
        </div>
        {isOtherPiece && (
          <TextField
            id="commission-piece-other"
            label="Describe the piece"
            autoComplete="off"
            placeholder="A lidded jar, a set of four cups…"
            error={errors.pieceType?.message}
            registration={register("pieceType")}
          />
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* A listed piece offers the sizes its pages carry; anything else is described in words. */}
          {sizes.length > 0 || !hasPiece ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="commission-size">Size</Label>
              <Controller
                control={control}
                name="size"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!hasPiece}
                  >
                    <SelectTrigger
                      id="commission-size"
                      className="w-full"
                      aria-invalid={Boolean(errors.size)}
                    >
                      <SelectValue
                        placeholder={
                          hasPiece ? "Pick a size" : "Pick the piece first"
                        }
                      />
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
          ) : (
            <TextField
              id="commission-size"
              label="Size"
              autoComplete="off"
              placeholder="About 20 cm across, holds 300 ml…"
              error={errors.size?.message}
              registration={register("size")}
            />
          )}

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
                      <SelectItem key={glaze.slug} value={glaze.name}>
                        <span className="flex items-center gap-2">
                          <GlazeSwatch
                            name={glaze.name}
                            colorCode={glaze.colorCode}
                            size="sm"
                          />
                          {glaze.name}
                        </span>
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
