import { z } from "zod";

import { EventLevel, EventType } from "@/graphql/generated/graphql";

// What <input type="datetime-local"> hands back, seconds left off.
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function requiredText(label: string, max: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);
}

export const eventSchema = z
  .object({
    title: requiredText("Title", 120),
    description: requiredText("Description", 4000),
    event_type: z.enum(EventType),
    level: z.enum(EventLevel),
    starts_at: z
      .string()
      .regex(LOCAL_DATETIME, "Pick the date and time it starts"),
    ends_at: z.string().regex(LOCAL_DATETIME, "Pick the date and time it ends"),
    location: requiredText("Location", 120),
    address: requiredText("Address", 240),
    price: z
      .number({ error: "Enter a price in rupees" })
      .int("Price must be whole rupees")
      .min(0, "Price cannot be negative"),
    total_seats: z
      .number({ error: "Enter how many seats there are" })
      .int("Seats must be a whole number")
      .min(1, "There has to be at least one seat"),
    instructor: z
      .string()
      .trim()
      .max(120, "Instructor must be 120 characters or fewer"),
    image_url: z.string().trim().min(1, "A cover photo is required"),
    gallery: z.array(z.string()),
    highlights: z.string(),
    includes: z.string(),
    performers: z.string(),
  })
  // Both sides are the same fixed-width format, so a string compare orders them.
  .refine((values) => values.ends_at > values.starts_at, {
    path: ["ends_at"],
    message: "The end has to be after the start",
  });

export type EventFormValues = z.infer<typeof eventSchema>;
