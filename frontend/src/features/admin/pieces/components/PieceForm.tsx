"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  type ProductFormValues,
  productSchema,
} from "@/lib/validations/admin/product";

import { AdminField, toNullableNumber } from "@/features/admin/ui";

interface PieceTaxonomyOption {
  id: number;
  name: string;
}

export interface PieceFormProps {
  defaultValues: ProductFormValues;
  isCreate: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  categoryOptions: PieceTaxonomyOption[];
  collectionOptions: PieceTaxonomyOption[];
  gallery: ReactNode;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
}

export function PieceForm({
  defaultValues,
  isCreate,
  isSubmitting,
  submitLabel,
  categoryOptions,
  collectionOptions,
  gallery,
  onSubmit,
  onCancel,
}: PieceFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const categoryIds = useWatch({ control, name: "category_ids" });
  const collectionId = useWatch({ control, name: "collection_id" });
  const isCustomizable = useWatch({ control, name: "is_customizable" });
  const isFeatured = useWatch({ control, name: "is_featured" });
  const isActive = useWatch({ control, name: "is_active" });

  const handleCategoryToggle = (id: number, isPicked: boolean) => {
    const next = isPicked
      ? [...categoryIds, id]
      : categoryIds.filter((value) => value !== id);
    setValue("category_ids", next, { shouldDirty: true });
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      <section className="grid gap-4 md:grid-cols-2">
        <AdminField
          id="piece-name"
          label="Name"
          hint="Name it like an object on a shelf."
          error={errors.name?.message}
        >
          <Input
            id="piece-name"
            type="text"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </AdminField>
        <AdminField
          id="piece-material"
          label="Clay body"
          hint={null}
          error={errors.material?.message}
        >
          <Input
            id="piece-material"
            type="text"
            placeholder="Stoneware"
            aria-invalid={Boolean(errors.material)}
            {...register("material")}
          />
        </AdminField>
        <div className="md:col-span-2">
          <AdminField
            id="piece-description"
            label="Description"
            hint="Three sentences at most."
            error={errors.description?.message}
          >
            <Textarea
              id="piece-description"
              rows={4}
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
          </AdminField>
        </div>
        <AdminField
          id="piece-dimensions"
          label="Dimensions"
          hint={null}
          error={errors.dimensions?.message}
        >
          <Input
            id="piece-dimensions"
            type="text"
            placeholder="9 cm × 8 cm"
            aria-invalid={Boolean(errors.dimensions)}
            {...register("dimensions")}
          />
        </AdminField>
        <AdminField
          id="piece-color-name"
          label="Glaze"
          hint={null}
          error={errors.color_name?.message}
        >
          <Input
            id="piece-color-name"
            type="text"
            placeholder="Slate"
            aria-invalid={Boolean(errors.color_name)}
            {...register("color_name")}
          />
        </AdminField>
        <AdminField
          id="piece-color-code"
          label="Glaze colour"
          hint="A hex colour, or leave it empty."
          error={errors.color_code?.message}
        >
          <Input
            id="piece-color-code"
            type="text"
            placeholder="#4F6F52"
            aria-invalid={Boolean(errors.color_code)}
            {...register("color_code")}
          />
        </AdminField>
        <div className="md:col-span-2">
          <AdminField
            id="piece-care-notes"
            label="Care notes"
            hint="One note per line."
            error={errors.care_notes?.message}
          >
            <Textarea
              id="piece-care-notes"
              rows={3}
              aria-invalid={Boolean(errors.care_notes)}
              {...register("care_notes")}
            />
          </AdminField>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <AdminField
          id="piece-price"
          label="Price"
          hint="Whole rupees."
          error={errors.price?.message}
        >
          <Input
            id="piece-price"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="tnum"
            aria-invalid={Boolean(errors.price)}
            {...register("price", { valueAsNumber: true })}
          />
        </AdminField>
        <AdminField
          id="piece-compare-price"
          label="Compare at price"
          hint="Leave it empty unless the piece is reduced."
          error={errors.compare_at_price?.message}
        >
          <Input
            id="piece-compare-price"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            className="tnum"
            aria-invalid={Boolean(errors.compare_at_price)}
            {...register("compare_at_price", {
              setValueAs: toNullableNumber,
            })}
          />
        </AdminField>
        {/* On an existing piece stock only moves through the guarded adjustment. */}
        {isCreate && (
          <AdminField
            id="piece-stock"
            label="Stock"
            hint="How many are made in this batch."
            error={errors.stock?.message}
          >
            <Input
              id="piece-stock"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="tnum"
              aria-invalid={Boolean(errors.stock)}
              {...register("stock", { valueAsNumber: true })}
            />
          </AdminField>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Photos
        </h2>
        {gallery}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Categories
          </legend>
          {categoryOptions.length === 0 && (
            <p className="text-[13px] text-muted-foreground">
              No categories yet.
            </p>
          )}
          {categoryOptions.map((option) => (
            <Label
              key={option.id}
              htmlFor={`piece-category-${option.id}`}
              className="flex items-center gap-2 text-[13px]"
            >
              <Checkbox
                id={`piece-category-${option.id}`}
                checked={categoryIds.includes(option.id)}
                onCheckedChange={(checked) =>
                  handleCategoryToggle(option.id, checked === true)
                }
              />
              {option.name}
            </Label>
          ))}
        </fieldset>
        <div className="flex flex-col gap-4">
          <AdminField
            id="piece-collection"
            label="Collection"
            hint={null}
            error={errors.collection_id?.message}
          >
            <select
              id="piece-collection"
              value={collectionId === null ? "" : String(collectionId)}
              onChange={(event) =>
                setValue(
                  "collection_id",
                  event.target.value === "" ? null : Number(event.target.value),
                  { shouldDirty: true },
                )
              }
              className="h-11 w-full border border-ash bg-transparent px-2.5 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="">No collection</option>
              {collectionOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </AdminField>
          <Label
            htmlFor="piece-customizable"
            className="flex items-center gap-2 text-[13px]"
          >
            <Checkbox
              id="piece-customizable"
              checked={isCustomizable}
              onCheckedChange={(checked) =>
                setValue("is_customizable", checked === true, {
                  shouldDirty: true,
                })
              }
            />
            Made to order
          </Label>
          {isCreate && (
            <>
              <Label
                htmlFor="piece-featured"
                className="flex items-center gap-2 text-[13px]"
              >
                <Checkbox
                  id="piece-featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) =>
                    setValue("is_featured", checked === true, {
                      shouldDirty: true,
                    })
                  }
                />
                Show on the home page
              </Label>
              <Label
                htmlFor="piece-active"
                className="flex items-center gap-2 text-[13px]"
              >
                <Checkbox
                  id="piece-active"
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    setValue("is_active", checked === true, {
                      shouldDirty: true,
                    })
                  }
                />
                Live on the shelf
              </Label>
            </>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-ash pt-4">
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
