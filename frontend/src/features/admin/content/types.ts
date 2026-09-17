import type {
  AdminAnnouncementInput,
  AdminSiteSettingsFieldsFragment,
  AdminSiteSettingsInput,
  ContentPageInput,
} from "@/graphql/generated/graphql";

import { formatDateTime } from "@/lib/format";
import type {
  AnnouncementFormValues,
  ContentPageFormValues,
  SiteSettingsFormValues,
} from "@/lib/validations/admin/content";

import type { AdminStatusTone } from "@/features/admin/ui";

export interface ContentPageDraft {
  slug: string;
  title: string;
  subtitle: string | null;
  hero_image_url: string | null;
  is_published: boolean;
  updated_at: string;
  sections: {
    heading: string;
    body: string;
    items: { title: string; body: string }[];
  }[];
}

export const EMPTY_SECTION: ContentPageFormValues["sections"][number] = {
  heading: "",
  body: "",
  items: [],
};

export const EMPTY_ITEM = { title: "", body: "" };

export function emptyPageValues(): ContentPageFormValues {
  return {
    title: "",
    subtitle: "",
    is_published: false,
    sections: [{ ...EMPTY_SECTION }],
  };
}

export function toPageFormValues(
  page: ContentPageDraft,
): ContentPageFormValues {
  return {
    title: page.title,
    subtitle: page.subtitle ?? "",
    is_published: page.is_published,
    sections: page.sections.map((section) => ({
      heading: section.heading,
      body: section.body,
      items: section.items.map((item) => ({
        title: item.title,
        body: item.body,
      })),
    })),
  };
}

export function toContentPageInput(
  values: ContentPageFormValues,
  heroImageUrl: string | null,
): ContentPageInput {
  return {
    title: values.title,
    subtitle: values.subtitle.length > 0 ? values.subtitle : null,
    hero_image_url: heroImageUrl,
    is_published: values.is_published,
    sections: values.sections.map((section) => ({
      heading: section.heading,
      body: section.body,
      items: section.items.map((item) => ({
        title: item.title,
        body: item.body,
      })),
    })),
  };
}

/** Rupee fields are typed as text so an empty box means "no threshold" instead of NaN. */
export function toRupees(value: string): number | null {
  if (value.length === 0) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

export function formatRupeeField(value: number | null): string {
  return value === null ? "" : String(value);
}

export function toSettingsFormValues(
  settings: AdminSiteSettingsFieldsFragment,
): SiteSettingsFormValues {
  return {
    contact_email: settings.contact_email,
    contact_phone: settings.contact_phone,
    whatsapp_number: settings.whatsapp_number,
    address: settings.address,
    opening_hours: settings.opening_hours,
    instagram_url: settings.instagram_url,
    facebook_url: settings.facebook_url,
    youtube_url: settings.youtube_url,
    shipping_flat_fee: formatRupeeField(settings.shipping_flat_fee),
    free_shipping_above: formatRupeeField(settings.free_shipping_above),
    dispatch_days_min: String(settings.dispatch_days_min),
    dispatch_days_max: String(settings.dispatch_days_max),
    hero_heading: settings.hero_heading,
    hero_subheading: settings.hero_subheading,
    hero_cta_text: settings.hero_cta_text,
    hero_cta_href: settings.hero_cta_href,
  };
}

export type SiteSettingsPatch = Omit<
  AdminSiteSettingsFieldsFragment,
  "announcement_text" | "announcement_href" | "updated_at"
>;

/** The same shape works as the mutation input and as the optimistic patch. */
export function toSettingsPatch(
  values: SiteSettingsFormValues,
  heroImageUrl: string | null,
): SiteSettingsPatch {
  return {
    contact_email: values.contact_email,
    contact_phone: values.contact_phone,
    whatsapp_number: values.whatsapp_number,
    address: values.address,
    opening_hours: values.opening_hours,
    instagram_url: values.instagram_url,
    facebook_url: values.facebook_url,
    youtube_url: values.youtube_url,
    shipping_flat_fee: toRupees(values.shipping_flat_fee) ?? 0,
    free_shipping_above: toRupees(values.free_shipping_above),
    dispatch_days_min: Number(values.dispatch_days_min),
    dispatch_days_max: Number(values.dispatch_days_max),
    hero_heading: values.hero_heading,
    hero_subheading: values.hero_subheading,
    hero_cta_text: values.hero_cta_text,
    hero_cta_href: values.hero_cta_href,
    hero_image_url: heroImageUrl ?? "",
  };
}

export function toSettingsInput(
  values: SiteSettingsFormValues,
  heroImageUrl: string | null,
): AdminSiteSettingsInput {
  return toSettingsPatch(values, heroImageUrl);
}

export function toAnnouncementFormValues(
  settings: AdminSiteSettingsFieldsFragment,
): AnnouncementFormValues {
  return {
    text: settings.announcement_text ?? "",
    href: settings.announcement_href ?? "",
  };
}

export function toAnnouncementInput(
  values: AnnouncementFormValues,
): AdminAnnouncementInput {
  const text = values.text.length > 0 ? values.text : null;
  return {
    text,
    href: text === null || values.href.length === 0 ? null : values.href,
  };
}

export function publishLabel(isPublished: boolean): string {
  return isPublished ? "Published" : "Draft";
}

export function publishTone(isPublished: boolean): AdminStatusTone {
  return isPublished ? "live" : "quiet";
}

export function describeSaved(updatedAt: string | null): string {
  return updatedAt === null
    ? "Not saved yet"
    : `Last saved ${formatDateTime(updatedAt)}`;
}

/** Reorder buttons stay enabled only while there is somewhere to go. */
export function nextIndex(
  length: number,
  from: number,
  direction: -1 | 1,
): number | null {
  const to = from + direction;
  return to >= 0 && to < length ? to : null;
}

/** The editor doubles as the "new page" form, so a missing page is not an error to show. */
export function isMissingPage(message: string): boolean {
  return /not found/i.test(message);
}

/** The sentence a product page shows: "ships in 7 to 12 days". */
export function describeDispatchWindow(min: number, max: number): string {
  return min === max
    ? `Ships in about ${min} days`
    : `Ships in ${min} to ${max} days`;
}
