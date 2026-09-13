"use client";

import type { ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import {
  contentPageSchema,
  type ContentPageFormValues,
} from "@/lib/validations/admin/content";

import { EMPTY_ITEM, EMPTY_SECTION, nextIndex } from "../types";
import { ContentTextField } from "./ContentTextField";

interface SectionFieldsProps {
  control: Control<ContentPageFormValues>;
  register: UseFormRegister<ContentPageFormValues>;
  errors: FieldErrors<ContentPageFormValues>;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}

function SectionFields({
  control,
  register,
  errors,
  index,
  count,
  onMove,
  onRemove,
}: SectionFieldsProps) {
  const items = useFieldArray({
    control,
    name: `sections.${index}.items`,
  });
  const sectionErrors = errors.sections?.[index];
  const position = index + 1;
  const up = nextIndex(count, index, -1);
  const down = nextIndex(count, index, 1);

  return (
    <fieldset className="flex flex-col gap-4 border border-ash p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <legend className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Section {position}
        </legend>
        <span className="flex gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label={`Move section ${position} up`}
            disabled={up === null}
            onClick={() => up !== null && onMove(index, up)}
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label={`Move section ${position} down`}
            disabled={down === null}
            onClick={() => down !== null && onMove(index, down)}
          >
            ↓
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Remove section ${position}`}
            disabled={count === 1}
            onClick={() => onRemove(index)}
          >
            Remove
          </Button>
        </span>
      </div>

      <ContentTextField
        id={`section-${index}-heading`}
        label="Heading"
        hint={null}
        error={sectionErrors?.heading?.message}
        isMultiline={false}
        registration={register(`sections.${index}.heading`)}
      />
      <ContentTextField
        id={`section-${index}-body`}
        label="Body"
        hint="Blank lines start a new paragraph on the site."
        error={sectionErrors?.body?.message}
        isMultiline
        registration={register(`sections.${index}.body`)}
      />

      <div className="flex flex-col gap-3 border-t border-ash pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Items
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => items.append({ ...EMPTY_ITEM })}
          >
            Add item
          </Button>
        </div>
        {items.fields.length === 0 && (
          <p className="text-[12px] text-muted-foreground">
            Items become a list under the section. A section can have none.
          </p>
        )}
        {items.fields.map((item, itemIndex) => {
          const itemErrors = sectionErrors?.items?.[itemIndex];
          const itemPosition = itemIndex + 1;
          const itemUp = nextIndex(items.fields.length, itemIndex, -1);
          const itemDown = nextIndex(items.fields.length, itemIndex, 1);
          return (
            <div
              key={item.id}
              className="flex flex-col gap-3 border-t border-ash pt-3 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] text-muted-foreground">
                  Item {itemPosition}
                </span>
                <span className="flex gap-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    aria-label={`Move item ${itemPosition} of section ${position} up`}
                    disabled={itemUp === null}
                    onClick={() =>
                      itemUp !== null && items.move(itemIndex, itemUp)
                    }
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    aria-label={`Move item ${itemPosition} of section ${position} down`}
                    disabled={itemDown === null}
                    onClick={() =>
                      itemDown !== null && items.move(itemIndex, itemDown)
                    }
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove item ${itemPosition} of section ${position}`}
                    onClick={() => items.remove(itemIndex)}
                  >
                    Remove
                  </Button>
                </span>
              </div>
              <ContentTextField
                id={`section-${index}-item-${itemIndex}-title`}
                label="Item title"
                hint={null}
                error={itemErrors?.title?.message}
                isMultiline={false}
                registration={register(
                  `sections.${index}.items.${itemIndex}.title`,
                )}
              />
              <ContentTextField
                id={`section-${index}-item-${itemIndex}-body`}
                label="Item body"
                hint={null}
                error={itemErrors?.body?.message}
                isMultiline
                registration={register(
                  `sections.${index}.items.${itemIndex}.body`,
                )}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export interface ContentPageFormProps {
  defaultValues: ContentPageFormValues;
  savedLabel: string;
  isSaving: boolean;
  heroField: ReactNode;
  onSubmit: (values: ContentPageFormValues) => void;
}

export function ContentPageForm({
  defaultValues,
  savedLabel,
  isSaving,
  heroField,
  onSubmit,
}: ContentPageFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContentPageFormValues>({
    resolver: zodResolver(contentPageSchema),
    defaultValues,
  });
  const sections = useFieldArray({ control, name: "sections" });
  const isPublished = useWatch({ control, name: "is_published" });
  const sectionsError =
    errors.sections?.message ?? errors.sections?.root?.message;

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ContentTextField
          id="page-title"
          label="Title"
          hint={null}
          error={errors.title?.message}
          isMultiline={false}
          registration={register("title")}
        />
        <ContentTextField
          id="page-subtitle"
          label="Subtitle"
          hint="One line under the title. Optional."
          error={errors.subtitle?.message}
          isMultiline={false}
          registration={register("subtitle")}
        />
      </div>

      {heroField}

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-ash py-3">
        <Label
          htmlFor="page-published"
          className="w-fit gap-2.5 text-[13px] font-normal"
        >
          <Checkbox
            id="page-published"
            checked={isPublished}
            onCheckedChange={(checked) =>
              setValue("is_published", checked === true, { shouldDirty: true })
            }
          />
          Published on the site
        </Label>
        <p className="text-[12px] text-muted-foreground">{savedLabel}</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl leading-none tracking-tight">
            Sections
          </h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => sections.append({ ...EMPTY_SECTION, items: [] })}
          >
            Add section
          </Button>
        </div>
        {sectionsError && (
          <p role="alert" className="text-[12px] text-destructive">
            {sectionsError}
          </p>
        )}
        {sections.fields.map((section, index) => (
          <SectionFields
            key={section.id}
            control={control}
            register={register}
            errors={errors}
            index={index}
            count={sections.fields.length}
            onMove={(from, to) => sections.move(from, to)}
            onRemove={(target) => sections.remove(target)}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save page"}
        </Button>
      </div>
    </form>
  );
}
