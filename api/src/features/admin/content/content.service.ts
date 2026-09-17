import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { SiteSettings } from "@prisma/client";

import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import {
  contentCacheKey,
  ContentService,
} from "@/features/content/content.service";
import type {
  ContentPage,
  ContentPageInput,
  ContentPageSummary,
} from "@/features/content/content.type";
import { SettingsService } from "@/features/settings/settings.service";
import { slugify } from "../slug";
import { trimmed } from "../admin.type";
import { UploadsService } from "../uploads/uploads.service";
import { UploadPurpose } from "../uploads/uploads.type";
import type {
  AdminAnnouncementInput,
  AdminSiteSettingsInput,
} from "./content.type";

// The dispatch window is one sentence to a customer, so it has to read forwards.
export function assertDispatchDays(min: number, max: number): void {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < 1) {
    throw new BadRequestException("Dispatch days must be whole days");
  }
  if (min > max) {
    throw new BadRequestException(
      "The earliest dispatch day cannot be after the latest",
    );
  }
  if (max > 120) {
    throw new BadRequestException("Dispatch cannot be more than 120 days out");
  }
}

@Injectable()
export class AdminContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: ContentService,
    private readonly settings: SettingsService,
    private readonly redis: RedisService,
    private readonly uploads: UploadsService,
  ) {}

  pages(): Promise<ContentPageSummary[]> {
    return this.content.list();
  }

  // Unlike the public query this one also returns drafts, so a page can be edited before it goes live.
  async page(slug: string): Promise<ContentPage> {
    const row = await this.prisma.contentPage.findUnique({ where: { slug } });
    if (!row) {
      throw new NotFoundException("Page not found");
    }
    return row;
  }

  async savePage(slug: string, input: ContentPageInput): Promise<ContentPage> {
    const key = slugify(slug);
    if (key.length === 0) {
      throw new BadRequestException("A page needs a slug");
    }
    const current = await this.prisma.contentPage.findUnique({
      where: { slug: key },
      select: { hero_image_url: true },
    });
    const hero = input.hero_image_url?.trim() || null;
    await this.uploads.assertConfirmed(
      hero ? [hero] : [],
      current?.hero_image_url ? [current.hero_image_url] : [],
      UploadPurpose.CONTENT,
    );
    // ContentService owns the zod schema for the sections JSON and the cache key.
    return this.content.update(key, input);
  }

  async deletePage(slug: string): Promise<boolean> {
    // The same slugify that wrote the row, so a delete cannot miss the page it just read.
    const key = slugify(slug);
    await this.page(key);
    await this.prisma.contentPage.delete({ where: { slug: key } });
    await this.redis.del(contentCacheKey(key));
    return true;
  }

  async updateSettings(input: AdminSiteSettingsInput): Promise<SiteSettings> {
    if (
      input.shipping_flat_fee != null &&
      (!Number.isInteger(input.shipping_flat_fee) ||
        input.shipping_flat_fee < 0)
    ) {
      throw new BadRequestException(
        "Shipping must be a whole number of rupees",
      );
    }
    if (input.free_shipping_above != null && input.free_shipping_above < 0) {
      throw new BadRequestException(
        "The free shipping threshold cannot be negative",
      );
    }
    const hero = input.hero_image_url?.trim() || null;
    const stored = await this.settings.get();
    assertDispatchDays(
      input.dispatch_days_min ?? stored.dispatch_days_min,
      input.dispatch_days_max ?? stored.dispatch_days_max,
    );
    if (input.hero_image_url !== undefined) {
      const current = stored;
      await this.uploads.assertConfirmed(
        hero ? [hero] : [],
        current.hero_image_url ? [current.hero_image_url] : [],
        UploadPurpose.HERO,
      );
    }
    return this.settings.update({
      ...(input.contact_phone == null
        ? {}
        : { contact_phone: input.contact_phone.trim() }),
      ...(input.whatsapp_number == null
        ? {}
        : { whatsapp_number: input.whatsapp_number.trim() }),
      ...(input.contact_email == null
        ? {}
        : { contact_email: input.contact_email.trim() }),
      ...(input.address == null ? {} : { address: input.address.trim() }),
      ...(input.opening_hours == null
        ? {}
        : { opening_hours: input.opening_hours.trim() }),
      ...(input.instagram_url == null
        ? {}
        : { instagram_url: input.instagram_url.trim() }),
      ...(input.facebook_url == null
        ? {}
        : { facebook_url: input.facebook_url.trim() }),
      ...(input.youtube_url == null
        ? {}
        : { youtube_url: input.youtube_url.trim() }),
      ...(input.shipping_flat_fee == null
        ? {}
        : { shipping_flat_fee: input.shipping_flat_fee }),
      ...(input.free_shipping_above === undefined
        ? {}
        : { free_shipping_above: input.free_shipping_above }),
      ...(input.dispatch_days_min == null
        ? {}
        : { dispatch_days_min: input.dispatch_days_min }),
      ...(input.dispatch_days_max == null
        ? {}
        : { dispatch_days_max: input.dispatch_days_max }),
      ...(input.hero_heading == null
        ? {}
        : { hero_heading: input.hero_heading.trim() }),
      ...(input.hero_subheading == null
        ? {}
        : { hero_subheading: input.hero_subheading.trim() }),
      ...(input.hero_image_url === undefined
        ? {}
        : { hero_image_url: hero ?? "" }),
      ...(input.hero_cta_text == null
        ? {}
        : { hero_cta_text: input.hero_cta_text.trim() }),
      ...(input.hero_cta_href == null
        ? {}
        : { hero_cta_href: input.hero_cta_href.trim() }),
    });
  }

  updateAnnouncement(input: AdminAnnouncementInput): Promise<SiteSettings> {
    const text = trimmed(input.text, 160);
    return this.settings.update({
      announcement_text: text,
      announcement_href: text === null ? null : trimmed(input.href, 300),
    });
  }
}
