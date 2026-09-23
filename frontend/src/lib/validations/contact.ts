import { z } from "zod";

export const MAX_MESSAGE = 2000;

const TEN_DIGITS = /^(?:\+?91|0)?(\d{10})$/;

export const contactSchema = z.object({
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
  subject: z
    .string()
    .trim()
    .max(120, "Subject must be 120 characters or fewer"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(MAX_MESSAGE, `Message must be ${MAX_MESSAGE} characters or fewer`),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const EMPTY_CONTACT_FORM: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};
