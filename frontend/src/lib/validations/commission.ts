import { z } from "zod";

const TEN_DIGITS = /^(?:\+?91|0)?(\d{10})$/;

// The words are carved into wet clay by hand, so the rim sets the limit.
export const MAX_CARVED_WORDS = 40;
export const MAX_NOTES = 1000;

export const commissionSchema = z.object({
  pieceType: z
    .string()
    .trim()
    .min(2, "Say which piece you have in mind")
    .max(60, "Piece must be 60 characters or fewer"),
  size: z.string().trim().min(1, "Pick a size"),
  glaze: z.string().trim().min(1, "Pick a glaze"),
  carvedWords: z
    .string()
    .trim()
    .max(MAX_CARVED_WORDS, `Keep the words to ${MAX_CARVED_WORDS} characters`),
  notes: z
    .string()
    .trim()
    .max(MAX_NOTES, `Notes must be ${MAX_NOTES} characters or fewer`),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  email: z
    .string()
    .trim()
    .max(120, "Email must be 120 characters or fewer")
    .pipe(z.email("Enter a valid email address")),
  phone: z
    .string()
    .trim()
    .refine(
      (value) =>
        value.length === 0 || TEN_DIGITS.test(value.replace(/[\s-]/g, "")),
      "Enter a valid 10-digit phone number",
    ),
});

export type CommissionFormValues = z.infer<typeof commissionSchema>;

export const EMPTY_COMMISSION_FORM: CommissionFormValues = {
  pieceType: "",
  size: "",
  glaze: "",
  carvedWords: "",
  notes: "",
  name: "",
  email: "",
  phone: "",
};
