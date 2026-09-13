"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { OptionGroupKind } from "@/graphql/generated/graphql";

import {
  type OptionGroupFormValues,
  optionGroupSchema,
} from "@/lib/validations/admin/product";

import { AdminField } from "@/features/admin/ui";

export interface OptionGroupFormProps {
  title: string;
  defaultValues: OptionGroupFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: OptionGroupFormValues) => void;
  onCancel: () => void;
}

export function OptionGroupForm({
  title,
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: OptionGroupFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OptionGroupFormValues>({
    resolver: zodResolver(optionGroupSchema),
    defaultValues,
  });

  const kind = useWatch({ control, name: "kind" });
  const isRequired = useWatch({ control, name: "is_required" });

  return (
    <form
      noValidate
      className="flex flex-col gap-4 border border-ash p-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h3 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField
          id="group-name"
          label="Name"
          hint={null}
          error={errors.name?.message}
        >
          <Input
            id="group-name"
            type="text"
            placeholder="Handle"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </AdminField>
        <AdminField
          id="group-kind"
          label="Kind"
          hint="Choice offers a list. Text takes a line from the buyer."
          error={errors.kind?.message}
        >
          <select
            id="group-kind"
            value={kind}
            onChange={(event) =>
              setValue("kind", event.target.value as OptionGroupKind, {
                shouldDirty: true,
              })
            }
            className="h-11 w-full border border-ash bg-transparent px-2.5 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value={OptionGroupKind.Choice}>Choice</option>
            <option value={OptionGroupKind.Text}>Text</option>
          </select>
        </AdminField>
        <AdminField
          id="group-price"
          label="Price change"
          hint="Whole rupees added to the piece."
          error={errors.price_modifier?.message}
        >
          <Input
            id="group-price"
            type="number"
            step={1}
            inputMode="numeric"
            className="tnum"
            aria-invalid={Boolean(errors.price_modifier)}
            {...register("price_modifier", { valueAsNumber: true })}
          />
        </AdminField>
        <AdminField
          id="group-sort"
          label="Sort order"
          hint={null}
          error={errors.sort_order?.message}
        >
          <Input
            id="group-sort"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="tnum"
            aria-invalid={Boolean(errors.sort_order)}
            {...register("sort_order", { valueAsNumber: true })}
          />
        </AdminField>
        {kind === OptionGroupKind.Text && (
          <AdminField
            id="group-max-length"
            label="Longest line"
            hint="Leave it empty for no limit."
            error={errors.max_length?.message}
          >
            <Input
              id="group-max-length"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              className="tnum"
              aria-invalid={Boolean(errors.max_length)}
              {...register("max_length", {
                setValueAs: (value: string) =>
                  value === "" ? null : Number(value),
              })}
            />
          </AdminField>
        )}
      </div>
      <Label
        htmlFor="group-required"
        className="flex items-center gap-2 text-[13px]"
      >
        <Checkbox
          id="group-required"
          checked={isRequired}
          onCheckedChange={(checked) =>
            setValue("is_required", checked === true, { shouldDirty: true })
          }
        />
        The buyer has to pick one
      </Label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
