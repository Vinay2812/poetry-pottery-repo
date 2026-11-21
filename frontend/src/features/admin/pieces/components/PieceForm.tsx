"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  type ProductFormValues,
  productSchema,
} from "@/lib/validations/admin/product";

import {
  AdminCheckboxField,
  AdminField,
  AdminFormSection,
  toNullableNumber,
  toPreviewColour,
} from "@/features/admin/ui";
import {
  canGoLive,
  describeNewFeatureHint,
  findHomeShelfBlock,
  LIVE_BLOCKED_NOTE,
} from "@/features/admin/pieces/types";

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
  glazeOptions: PieceTaxonomyOption[];
  gallery: ReactNode;
  onSubmit: (values: ProductFormValues) => void;
  onInvalid: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  onCancel: () => void;
}

const SELECT_CLASS =
  "h-11 w-full border border-ash bg-transparent px-2.5 text-[13px] outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary";

function toSelectValue(id: number | null): string {
  return id === null ? "" : String(id);
}

function fromSelectValue(value: string): number | null {
  return value === "" ? null : Number(value);
}

export function PieceForm({
  defaultValues,
  isCreate,
  isSubmitting,
  submitLabel,
  categoryOptions,
  collectionOptions,
  glazeOptions,
  gallery,
  onSubmit,
  onInvalid,
  onDirtyChange,
  onCancel,
}: PieceFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const categoryIds = useWatch({ control, name: "category_ids" });
  const collectionId = useWatch({ control, name: "collection_id" });
  const glazeId = useWatch({ control, name: "glaze_id" });
  const colorCode = useWatch({ control, name: "color_code" });
  const isCustomizable = useWatch({ control, name: "is_customizable" });
  const stockValue = useWatch({ control, name: "stock" });
  const isSecond = useWatch({ control, name: "is_second" });
  const isCommission = useWatch({ control, name: "is_commission" });
  const isFeatured = useWatch({ control, name: "is_featured" });
  const isActive = useWatch({ control, name: "is_active" });

  const isLiveAllowed = canGoLive(Number(stockValue) || 0, isCustomizable);
  const isOnShelf = isActive && isLiveAllowed;
  const featureBlock = findHomeShelfBlock({
    isActive: isOnShelf,
    isCustomizable,
    stock: Number(stockValue) || 0,
  });
  const swatchColour = toPreviewColour(colorCode);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const setFlag = (
    name:
      | "is_customizable"
      | "is_second"
      | "is_commission"
      | "is_featured"
      | "is_active",
    isOn: boolean,
  ) => setValue(name, isOn, { shouldDirty: true });

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
      onSubmit={handleSubmit(onSubmit, onInvalid)}
    >
      <AdminFormSection
        title="The piece"
        description="What a buyer reads on the product page."
      >
        <div className="grid gap-4 md:grid-cols-2">
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
        </div>
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
        <AdminField
          id="piece-maker-note"
          label="Maker's note"
          hint="One or two lines in the maker's own voice."
          error={errors.maker_note?.message}
        >
          <Textarea
            id="piece-maker-note"
            rows={2}
            aria-invalid={Boolean(errors.maker_note)}
            {...register("maker_note")}
          />
        </AdminField>
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
      </AdminFormSection>

      <AdminFormSection
        title={isCreate ? "Price and stock" : "Price"}
        description={
          isCreate
            ? "Whole rupees, and how many are in this batch."
            : "Whole rupees. Stock changes through Change the stock, above."
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminField
            id="piece-price"
            label="Price"
            hint={null}
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
            label="Old price"
            hint="Only when the piece is reduced."
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
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="Photos"
        description="The first photo leads on the card. New photos and a new order are kept once you save."
      >
        {gallery}
      </AdminFormSection>

      <AdminFormSection
        title="Glaze"
        description="Pick it from the glaze shelf so the piece links to its page."
      >
        <AdminField
          id="piece-glaze"
          label="Glaze"
          hint={null}
          error={errors.glaze_id?.message}
        >
          <select
            id="piece-glaze"
            value={toSelectValue(glazeId)}
            onChange={(event) =>
              setValue("glaze_id", fromSelectValue(event.target.value), {
                shouldDirty: true,
              })
            }
            className={SELECT_CLASS}
          >
            <option value="">No glaze</option>
            {glazeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </AdminField>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField
            id="piece-color-name"
            label="Shorter name for the card"
            hint="Only when the glaze name is too long for a card."
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
            label="Colour"
            hint="A hex colour like #4F6F52, or leave it empty."
            error={errors.color_code?.message}
          >
            <div className="flex gap-2">
              <Input
                id="piece-color-code"
                type="text"
                placeholder="#4F6F52"
                aria-invalid={Boolean(errors.color_code)}
                {...register("color_code")}
              />
              <span
                aria-hidden="true"
                className="aspect-square shrink-0 self-stretch border border-ash bg-white"
                style={
                  swatchColour ? { backgroundColor: swatchColour } : undefined
                }
              />
            </div>
          </AdminField>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="Size"
        description="Leave a box empty until the piece has been measured."
      >
        <AdminField
          id="piece-dimensions"
          label="Dimensions"
          hint="Shown as written, like 9 cm × 8 cm."
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <AdminField
            id="piece-capacity"
            label="Capacity (ml)"
            hint={null}
            error={errors.capacity_ml?.message}
          >
            <Input
              id="piece-capacity"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              className="tnum"
              aria-invalid={Boolean(errors.capacity_ml)}
              {...register("capacity_ml", { setValueAs: toNullableNumber })}
            />
          </AdminField>
          <AdminField
            id="piece-height"
            label="Height (cm)"
            hint={null}
            error={errors.height_cm?.message}
          >
            <Input
              id="piece-height"
              type="number"
              min={0}
              step={0.1}
              inputMode="decimal"
              className="tnum"
              aria-invalid={Boolean(errors.height_cm)}
              {...register("height_cm", { setValueAs: toNullableNumber })}
            />
          </AdminField>
          <AdminField
            id="piece-diameter"
            label="Diameter (cm)"
            hint={null}
            error={errors.diameter_cm?.message}
          >
            <Input
              id="piece-diameter"
              type="number"
              min={0}
              step={0.1}
              inputMode="decimal"
              className="tnum"
              aria-invalid={Boolean(errors.diameter_cm)}
              {...register("diameter_cm", { setValueAs: toNullableNumber })}
            />
          </AdminField>
          <AdminField
            id="piece-weight"
            label="Weight (g)"
            hint={null}
            error={errors.weight_g?.message}
          >
            <Input
              id="piece-weight"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              className="tnum"
              aria-invalid={Boolean(errors.weight_g)}
              {...register("weight_g", { setValueAs: toNullableNumber })}
            />
          </AdminField>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title="Where it sits"
        description="The shelves it is found on, and how it is sold."
      >
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Categories
          </legend>
          {categoryOptions.length === 0 && (
            <p className="text-[13px] text-muted-foreground">
              No categories yet.
            </p>
          )}
          <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-3">
            {categoryOptions.map((option) => (
              <AdminCheckboxField
                key={option.id}
                id={`piece-category-${option.id}`}
                label={option.name}
                hint={null}
                isChecked={categoryIds.includes(option.id)}
                isDisabled={false}
                onCheckedChange={(isPicked) =>
                  handleCategoryToggle(option.id, isPicked)
                }
              />
            ))}
          </div>
        </fieldset>
        <AdminField
          id="piece-collection"
          label="Collection"
          hint={null}
          error={errors.collection_id?.message}
        >
          <select
            id="piece-collection"
            value={toSelectValue(collectionId)}
            onChange={(event) =>
              setValue("collection_id", fromSelectValue(event.target.value), {
                shouldDirty: true,
              })
            }
            className={SELECT_CLASS}
          >
            <option value="">No collection</option>
            {collectionOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminCheckboxField
          id="piece-customizable"
          label="Made to order"
          hint="Thrown after someone orders it, so it can sell with no stock."
          isChecked={isCustomizable}
          isDisabled={false}
          onCheckedChange={(isOn) => setFlag("is_customizable", isOn)}
        />
        <AdminCheckboxField
          id="piece-commission"
          label="Show as past commission"
          hint="Listed with past work on the made-to-order page."
          isChecked={isCommission}
          isDisabled={false}
          onCheckedChange={(isOn) => setFlag("is_commission", isOn)}
        />
        {isCreate && (
          <>
            <AdminCheckboxField
              id="piece-active"
              label="Put it on the shelf"
              hint={isLiveAllowed ? null : LIVE_BLOCKED_NOTE}
              isChecked={isOnShelf}
              isDisabled={!isLiveAllowed}
              onCheckedChange={(isOn) => {
                setFlag("is_active", isOn);
                // Off the shelf means off the home page too.
                if (!isOn) setFlag("is_featured", false);
              }}
            />
            <AdminCheckboxField
              id="piece-featured"
              label="Put first among home page pieces"
              hint={describeNewFeatureHint(featureBlock)}
              isChecked={isFeatured && featureBlock === null}
              isDisabled={featureBlock !== null}
              onCheckedChange={(isOn) => setFlag("is_featured", isOn)}
            />
          </>
        )}
      </AdminFormSection>

      <AdminFormSection
        title="Seconds"
        description="A piece the kiln marked. Name the flaw and the storefront shows it beside the price."
      >
        <AdminCheckboxField
          id="piece-second"
          label="Sell this as a second"
          hint={null}
          isChecked={isSecond}
          isDisabled={false}
          onCheckedChange={(isOn) => setFlag("is_second", isOn)}
        />
        {isSecond && (
          <AdminField
            id="piece-flaw-note"
            label="Flaw note"
            hint="What the kiln left, in one line."
            error={errors.flaw_note?.message}
          >
            <Textarea
              id="piece-flaw-note"
              rows={2}
              aria-invalid={Boolean(errors.flaw_note)}
              {...register("flaw_note")}
            />
          </AdminField>
        )}
      </AdminFormSection>

      {/* The save stays in reach on a long form, on a phone most of all. */}
      <div className="sticky bottom-0 z-10 flex flex-wrap gap-3 border-t border-ash bg-background py-3">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
