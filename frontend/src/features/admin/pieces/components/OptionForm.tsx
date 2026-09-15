"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  type ProductOptionFormValues,
  productOptionSchema,
} from "@/lib/validations/admin/product";

import { AdminField } from "@/features/admin/ui";

export interface OptionFormProps {
  title: string;
  defaultValues: ProductOptionFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: ProductOptionFormValues) => void;
  onCancel: () => void;
}

export function OptionForm({
  title,
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: OptionFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductOptionFormValues>({
    resolver: zodResolver(productOptionSchema),
    defaultValues,
  });

  const isActive = useWatch({ control, name: "is_active" });

  return (
    <form
      noValidate
      className="flex flex-col gap-4 border border-ash p-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h3 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="grid gap-4 md:grid-cols-3">
        <AdminField
          id="option-name"
          label="Name"
          hint={null}
          error={errors.name?.message}
        >
          <Input
            id="option-name"
            type="text"
            placeholder="No handle"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </AdminField>
        <AdminField
          id="option-price"
          label="Price change"
          hint="A minus sign takes rupees off."
          error={errors.price_modifier?.message}
        >
          <Input
            id="option-price"
            type="number"
            step={1}
            inputMode="numeric"
            className="tnum"
            aria-invalid={Boolean(errors.price_modifier)}
            {...register("price_modifier", { valueAsNumber: true })}
          />
        </AdminField>
        <AdminField
          id="option-sort"
          label="Sort order"
          hint={null}
          error={errors.sort_order?.message}
        >
          <Input
            id="option-sort"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="tnum"
            aria-invalid={Boolean(errors.sort_order)}
            {...register("sort_order", { valueAsNumber: true })}
          />
        </AdminField>
      </div>
      <Label
        htmlFor="option-active"
        className="flex items-center gap-2 text-[13px]"
      >
        <Checkbox
          id="option-active"
          checked={isActive}
          onCheckedChange={(checked) =>
            setValue("is_active", checked === true, { shouldDirty: true })
          }
        />
        Offer this option
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
