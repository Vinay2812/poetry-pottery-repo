import { z } from "zod";

const MAX_DESCRIPTION = 600;

export const adminGlazeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be 60 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(1, "Say what this glaze looks like")
    .max(MAX_DESCRIPTION, `Keep it to ${MAX_DESCRIPTION} characters or fewer`),
  variation_note: z
    .string()
    .trim()
    .max(200, "Keep the variation note to 200 characters or fewer"),
  // Empty leaves the swatch to the photo alone.
  color_code: z
    .string()
    .trim()
    .regex(/^(?:#[0-9a-fA-F]{6})?$/, "Use a hex colour like #6F7D6B"),
});

export type AdminGlazeFormValues = z.infer<typeof adminGlazeSchema>;
