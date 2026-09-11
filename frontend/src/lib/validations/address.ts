import { z } from "zod";

const TEN_DIGITS = /^(?:\+?91|0)?(\d{10})$/;

// Accepts the ways people actually type an Indian number and keeps only the 10 digits.
function normalisePhone(value: string): string | null {
  const compact = value.replace(/[\s-]/g, "");
  return TEN_DIGITS.exec(compact)?.[1] ?? null;
}

function requiredText(label: string, min: number, max: number) {
  return z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`);
}

function optionalText(label: string, max: number) {
  return z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`);
}

export const addressSchema = z.object({
  name: requiredText("Name", 2, 80),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => normalisePhone(value) !== null,
      "Enter a valid 10-digit phone number",
    )
    .transform((value) => normalisePhone(value) ?? value),
  line1: requiredText("Address line 1", 3, 120),
  line2: optionalText("Address line 2", 120),
  landmark: optionalText("Landmark", 120),
  city: requiredText("City", 2, 60),
  state: requiredText("State", 2, 60),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be 6 digits"),
  is_default: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
