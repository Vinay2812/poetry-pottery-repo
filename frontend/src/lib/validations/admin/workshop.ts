import { z } from "zod";

import { isTimeZone } from "@/lib/timezones";

const TIME_INPUT = /^([01]\d|2[0-3]):[0-5]\d$/;

function wholeNumber(label: string, least: number) {
  return z
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(least, `${label} must be at least ${least}`);
}

export const workshopConfigSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must be 80 characters or fewer"),
    description: z
      .string()
      .trim()
      .max(600, "Description must be 600 characters or fewer"),
    is_active: z.boolean(),
    timezone: z
      .string()
      .trim()
      .min(1, "Timezone is required")
      .max(60, "Timezone must be 60 characters or fewer")
      .refine(isTimeZone, "Use an IANA zone like Asia/Kolkata"),
    opening_time: z.string().regex(TIME_INPUT, "Opening time is not valid"),
    closing_time: z.string().regex(TIME_INPUT, "Closing time is not valid"),
    slot_minutes: wholeNumber("Slot length", 1),
    capacity_per_slot: wholeNumber("Wheels per slot", 1),
    booking_window_days: wholeNumber("Booking window", 1),
    slot_span_days: wholeNumber("Session span", 1),
    closed_weekdays: z.array(
      z.number().int().min(0).max(6, "Weekdays run from 0 to 6"),
    ),
  })
  // Both fields are HH:mm, so comparing the strings compares the clock.
  .refine((values) => values.closing_time > values.opening_time, {
    message: "Closing time must be after opening time",
    path: ["closing_time"],
  });

export type WorkshopConfigFormValues = z.infer<typeof workshopConfigSchema>;

export const workshopTierSchema = z.object({
  hours: wholeNumber("Hours", 1),
  price_per_person: wholeNumber("Price per person", 0),
  pieces_per_person: wholeNumber("Pieces per person", 0),
});

export type WorkshopTierFormValues = z.infer<typeof workshopTierSchema>;

const DATE_TIME_INPUT = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;

export const workshopBlackoutSchema = z
  .object({
    starts_at: z.string().regex(DATE_TIME_INPUT, "Pick when it starts"),
    ends_at: z.string().regex(DATE_TIME_INPUT, "Pick when it ends"),
    reason: z
      .string()
      .trim()
      .max(160, "Reason must be 160 characters or fewer"),
  })
  // datetime-local values sort the same way the instants do.
  .refine((values) => values.ends_at > values.starts_at, {
    message: "The end must be after the start",
    path: ["ends_at"],
  });

export type WorkshopBlackoutFormValues = z.infer<typeof workshopBlackoutSchema>;
