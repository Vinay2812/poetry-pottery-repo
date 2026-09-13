import { z } from "zod";

const NAME = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name must be 60 characters or fewer");

export const adminCategorySchema = z.object({
  name: NAME,
  icon: z.string().trim().max(40, "Icon must be 40 characters or fewer"),
  sort_order: z
    .string()
    .trim()
    .regex(/^\d+$/, "Sort order must be a whole number"),
});

export type AdminCategoryFormValues = z.infer<typeof adminCategorySchema>;

// Both ends are datetime-local text, so comparing the strings compares the instants.
export const adminCollectionSchema = z
  .object({
    name: NAME,
    description: z
      .string()
      .trim()
      .max(400, "Description must be 400 characters or fewer"),
    starts_at: z.string().trim(),
    ends_at: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.starts_at === "" || values.ends_at === "") return;
    if (values.ends_at > values.starts_at) return;
    ctx.addIssue({
      code: "custom",
      path: ["ends_at"],
      message: "The end has to come after the start",
    });
  });

export type AdminCollectionFormValues = z.infer<typeof adminCollectionSchema>;
