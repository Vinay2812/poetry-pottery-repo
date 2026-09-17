import { z } from "zod";

const TEN_DIGITS = /^(?:\+?91|0)?(\d{10})$/;

export const visitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => TEN_DIGITS.test(value.replace(/[\s-]/g, "")),
      "Enter a valid 10-digit phone number",
    ),
  note: z.string().trim().max(500, "Note must be 500 characters or fewer"),
});

export type VisitFormValues = z.infer<typeof visitSchema>;

export const EMPTY_VISIT_FORM: VisitFormValues = {
  name: "",
  phone: "",
  note: "",
};
