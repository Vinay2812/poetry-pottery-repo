import { z } from "zod";

const TEN_DIGITS = /^(?:\+?91|0)?\d{10}$/;
const WITH_COUNTRY_CODE = /^\+?91\d{10}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WHOLE_RUPEES = /^\d+$/;

function compactPhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

// Accepts the ways people actually type an Indian number; it is saved as typed.
function isPhone(value: string): boolean {
  return TEN_DIGITS.test(compactPhone(value));
}

// wa.me links use the digits as stored, so they need the country code.
function isWhatsAppNumber(value: string): boolean {
  return WITH_COUNTRY_CODE.test(compactPhone(value));
}

/** A page slug is what goes in the URL: lowercase letters, digits and single dashes between them. */
export function isContentSlug(value: string): boolean {
  return SLUG.test(value);
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Links in the console can point at a page on this site or at a full URL elsewhere. */
export function isHref(value: string): boolean {
  return value.startsWith("/") || isHttpUrl(value);
}

function requiredText(label: string, max: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);
}

function optionalText(label: string, max: number) {
  return z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`);
}

function optionalUrl(label: string) {
  return z
    .string()
    .trim()
    .max(300, `${label} must be 300 characters or fewer`)
    .refine(
      (value) => value.length === 0 || isHttpUrl(value),
      `${label} must be a full URL starting with https://`,
    );
}

function rupeeField(label: string) {
  return z
    .string()
    .trim()
    .regex(WHOLE_RUPEES, `${label} must be a whole number of rupees`);
}

export const contentSlugSchema = z
  .string()
  .trim()
  .min(1, "A page needs a slug")
  .max(60, "A slug must be 60 characters or fewer")
  .refine(isContentSlug, "Use lowercase letters, digits and dashes only");

const contentSectionItemSchema = z.object({
  title: requiredText("An item title", 120),
  body: requiredText("An item body", 2000),
});

// A section can be a list alone (a FAQ group, "What to avoid"), so the body may be empty when it has items.
export function isSectionBodyOptional(itemCount: number): boolean {
  return itemCount > 0;
}

const contentSectionSchema = z
  .object({
    heading: requiredText("A section heading", 120),
    body: optionalText("A section body", 4000),
    items: z.array(contentSectionItemSchema),
  })
  .refine(
    (section) =>
      section.body.length > 0 || isSectionBodyOptional(section.items.length),
    {
      path: ["body"],
      message: "Write a body or add at least one item",
    },
  );

export const contentPageSchema = z.object({
  title: requiredText("Title", 120),
  subtitle: optionalText("Subtitle", 240),
  is_published: z.boolean(),
  sections: z.array(contentSectionSchema).min(1, "Add at least one section"),
});

export type ContentPageFormValues = z.infer<typeof contentPageSchema>;

const MAX_DAYS = 120;

/** A day count the window accepts: a whole number from 1 to 120, or null. */
export function parseDayCount(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const days = Number(trimmed);
  return days >= 1 && days <= MAX_DAYS ? days : null;
}

function dayCount(label: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) => parseDayCount(value) !== null,
      `${label} must be a whole number of days from 1 to ${MAX_DAYS}`,
    );
}

export const siteSettingsSchema = z
  .object({
    contact_email: z
      .string()
      .trim()
      .max(120, "Email must be 120 characters or fewer")
      .pipe(z.email("Enter a valid email address")),
    contact_phone: z
      .string()
      .trim()
      .refine(isPhone, "Phone must be a valid 10-digit phone number"),
    whatsapp_number: z
      .string()
      .trim()
      .refine(
        isWhatsAppNumber,
        "WhatsApp number needs 91 in front, like 91 98765 43210",
      ),
    address: requiredText("Address", 240),
    opening_hours: requiredText("Opening hours", 160),
    instagram_url: optionalUrl("Instagram"),
    facebook_url: optionalUrl("Facebook"),
    youtube_url: optionalUrl("YouTube"),
    shipping_flat_fee: rupeeField("Flat shipping"),
    free_shipping_above: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || WHOLE_RUPEES.test(value),
        "Free shipping above must be a whole number of rupees",
      ),
    dispatch_days_min: dayCount("Earliest arrival"),
    dispatch_days_max: dayCount("Latest arrival"),
    hero_heading: requiredText("Hero heading", 120),
    hero_subheading: requiredText("Hero subheading", 240),
    hero_cta_text: requiredText("Hero button text", 60),
    hero_cta_href: z
      .string()
      .trim()
      .min(1, "Hero button link is required")
      .refine(isHref, "Use a path like /products or a full URL"),
  })
  // A window that ends before it starts is not a sentence anyone can read.
  .refine(
    (values) =>
      Number(values.dispatch_days_min) <= Number(values.dispatch_days_max),
    {
      message: "The latest day cannot come before the earliest",
      path: ["dispatch_days_max"],
    },
  );

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;

export const announcementSchema = z
  .object({
    text: optionalText("Announcement text", 160),
    href: z
      .string()
      .trim()
      .max(300, "Announcement link must be 300 characters or fewer")
      .refine(
        (value) => value.length === 0 || isHref(value),
        "Use a path like /events or a full URL",
      ),
  })
  .refine((values) => values.text.length > 0 || values.href.length === 0, {
    message: "A link needs some text to sit on",
    path: ["text"],
  });

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
