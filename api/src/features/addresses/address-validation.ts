import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

import type { AddressInput } from "./addresses.type";

export interface AddressFields {
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const TEN_DIGITS = /^(?:\+?91|0)?(\d{10})$/;

// Accepts the ways people actually type an Indian number and keeps only the 10 digits.
export function normalisePhone(value: string): string | null {
  const compact = value.replace(/[\s-]/g, "");
  return TEN_DIGITS.exec(compact)?.[1] ?? null;
}

// Worded like the storefront form, so a message names the field by the label people see.
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
    .max(max, `${label} must be ${max} characters or fewer`)
    .nullish()
    .transform((value) => value || null);
}

const addressSchema = z.object({
  name: requiredText("Full name", "Enter a name", 2, 80),
  phone: z
    .string()
    .trim()
    .min(1, "Enter a phone number")
    .transform((value) => normalisePhone(value))
    .refine((value): value is string => value !== null, {
      message: "Enter a valid 10-digit phone number",
    }),
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
  is_default: z
    .boolean()
    .nullish()
    .transform((value) => value ?? false),
});

export function parseAddressInput(input: AddressInput): AddressFields {
  const result = addressSchema.safeParse(input);
  if (!result.success) {
    throw new BadRequestException(
      result.error.issues[0]?.message ?? "Check the address details",
    );
  }
  return result.data;
}
