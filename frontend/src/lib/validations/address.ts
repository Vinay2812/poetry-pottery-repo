import { z } from "zod";

const TEN_DIGITS = /^(?:\+?91|0)?(\d{10})$/;

// Accepts the ways people actually type an Indian number and keeps only the 10 digits.
function normalisePhone(value: string): string | null {
  const compact = value.replace(/[\s-]/g, "");
  return TEN_DIGITS.exec(compact)?.[1] ?? null;
}

// Messages name the field by its label on the form, and an empty field asks for it plainly.
function requiredText(
  label: string,
  emptyMessage: string,
  min: number,
  max: number,
) {
  return z
    .string()
    .trim()
    .min(1, emptyMessage)
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
  name: requiredText("Full name", "Enter your full name", 2, 80),
  phone: z
    .string()
    .trim()
    .min(1, "Enter a phone number")
    .refine(
      (value) => normalisePhone(value) !== null,
      "Enter a valid 10-digit phone number",
    )
    .transform((value) => normalisePhone(value) ?? value),
  line1: requiredText(
    "Flat, house or building",
    "Enter the flat, house or building",
    3,
    120,
  ),
  line2: optionalText("Area or street", 120),
  landmark: optionalText("Landmark", 120),
  city: requiredText("City", "Enter the city", 2, 60),
  state: requiredText("State", "Enter the state", 2, 60),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a 6-digit PIN code"),
  is_default: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
