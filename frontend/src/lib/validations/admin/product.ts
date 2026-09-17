import { z } from "zod";

import { OptionGroupKind } from "@/graphql/generated/graphql";

const MAX_CARE_NOTES = 2000;
const MAX_MAKER_NOTE = 500;
const MAX_DESCRIPTION = 4000;

// Money is whole rupees everywhere, so the console never accepts a decimal.
function rupees(label: string) {
  return z
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number of rupees`)
    .min(0, `${label} cannot be negative`);
}

function counter(label: string) {
  return z
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(0, `${label} cannot be negative`);
}

// A measurement is either missing or a real number; a zero-tall mug is a typo.
function measure(label: string, max: number) {
  return z
    .number({ error: `${label} must be a number` })
    .positive(`${label} must be more than zero`)
    .max(max, `${label} must be ${max} or less`)
    .nullable();
}

function wholeMeasure(label: string, max: number) {
  return z
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .positive(`${label} must be more than zero`)
    .max(max, `${label} must be ${max} or less`)
    .nullable();
}

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name must be 120 characters or fewer"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(
        MAX_DESCRIPTION,
        `Keep it to ${MAX_DESCRIPTION} characters or fewer`,
      ),
    price: rupees("Price"),
    compare_at_price: rupees("Compare at price").nullable(),
    material: z
      .string()
      .trim()
      .min(1, "Material is required")
      .max(80, "Material must be 80 characters or fewer"),
    dimensions: z
      .string()
      .trim()
      .max(120, "Dimensions must be 120 characters or fewer"),
    color_name: z
      .string()
      .trim()
      .max(60, "Glaze name must be 60 characters or fewer"),
    color_code: z
      .string()
      .trim()
      .regex(/^(?:#[0-9a-fA-F]{6})?$/, "Use a hex colour like #C4785A"),
    stock: counter("Stock"),
    care_notes: z
      .string()
      .max(MAX_CARE_NOTES, `Keep it to ${MAX_CARE_NOTES} characters or fewer`),
    capacity_ml: wholeMeasure("Capacity", 20000),
    height_cm: measure("Height", 999),
    diameter_cm: measure("Diameter", 999),
    weight_g: wholeMeasure("Weight", 50000),
    maker_note: z
      .string()
      .trim()
      .max(MAX_MAKER_NOTE, `Keep it to ${MAX_MAKER_NOTE} characters or fewer`),
    category_ids: z.array(z.number().int().positive()),
    collection_id: z.number().int().positive().nullable(),
    glaze_id: z.number().int().positive().nullable(),
    is_customizable: z.boolean(),
    is_second: z.boolean(),
    flaw_note: z
      .string()
      .trim()
      .max(200, "Keep the flaw note to 200 characters or fewer"),
    is_commission: z.boolean(),
    is_featured: z.boolean(),
    is_active: z.boolean(),
  })
  .refine(
    (values) =>
      values.compare_at_price === null ||
      values.compare_at_price >= values.price,
    {
      message: "Compare at price must be at least the price",
      path: ["compare_at_price"],
    },
  )
  .refine((values) => !values.is_second || values.flaw_note.length > 0, {
    message: "Say what the kiln left on this piece",
    path: ["flaw_note"],
  });

export type ProductFormValues = z.infer<typeof productSchema>;

export const optionGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or fewer"),
  kind: z.enum(OptionGroupKind),
  is_required: z.boolean(),
  sort_order: counter("Sort order"),
  price_modifier: z
    .number({ error: "Price change must be a number" })
    .int("Price change must be a whole number of rupees"),
  max_length: z
    .number({ error: "Length must be a number" })
    .int("Length must be a whole number")
    .min(1, "Length must be at least 1")
    .max(1000, "Length must be 1000 or fewer")
    .nullable(),
});

export type OptionGroupFormValues = z.infer<typeof optionGroupSchema>;

export const productOptionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be 80 characters or fewer"),
  price_modifier: z
    .number({ error: "Price change must be a number" })
    .int("Price change must be a whole number of rupees"),
  sort_order: counter("Sort order"),
  is_active: z.boolean(),
});

export type ProductOptionFormValues = z.infer<typeof productOptionSchema>;

export const stockAdjustSchema = z.object({
  delta: z
    .number({ error: "Enter a whole number" })
    .int("Enter a whole number")
    .refine((value) => value !== 0, "Enter a number other than zero"),
  reason: z
    .string()
    .trim()
    .min(3, "Say why the count changed")
    .max(160, "Keep the reason to 160 characters or fewer"),
});

export type StockAdjustFormValues = z.infer<typeof stockAdjustSchema>;
