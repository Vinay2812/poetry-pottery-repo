import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { z } from "zod";

import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import type {
  ContentPage,
  ContentPageInput,
  ContentPageSummary,
} from "./content.type";

const CACHE_TTL_SECONDS = 120;

export function contentCacheKey(slug: string): string {
  return `content:${slug}`;
}

const sectionSchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1)
    .max(120, "Heading must be 120 characters or fewer"),
  body: z
    .string()
    .trim()
    .max(5000, "Section body must be 5000 characters or fewer"),
  items: z
    .array(
      z.object({
        title: z
          .string()
          .trim()
          .min(1)
          .max(120, "Item title must be 120 characters or fewer"),
        body: z
          .string()
          .trim()
          .max(2000, "Item body must be 2000 characters or fewer"),
      }),
    )
    .max(20, "A section can hold at most 20 items")
    .nullish()
    .transform((items) => items ?? []),
});

const pageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2)
    .max(160, "Title must be 160 characters or fewer"),
  subtitle: z
    .string()
    .trim()
    .max(240, "Subtitle must be 240 characters or fewer")
    .nullish()
    .transform((value) => value || null),
  hero_image_url: z
    .union([z.url("Hero image must be a valid URL"), z.literal("")])
    .nullish()
    .transform((value) => value || null),
  sections: z
    .array(sectionSchema)
    .max(20, "A page can hold at most 20 sections"),
  is_published: z
    .boolean()
    .nullish()
    .transform((value) => value ?? true),
});

export type ContentPageFields = z.infer<typeof pageSchema>;

export function parseContentPageInput(
  input: ContentPageInput,
): ContentPageFields {
  const result = pageSchema.safeParse(input);
  if (!result.success) {
    throw new BadRequestException(
      result.error.issues[0]?.message ?? "Check the page content",
    );
  }
  return result.data;
}

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // Published pages are read on every marketing route, so they sit behind a short cache.
  async bySlug(slug: string): Promise<ContentPage> {
    const page = await this.redis.getOrSet(
      contentCacheKey(slug),
      CACHE_TTL_SECONDS,
      () =>
        this.prisma.contentPage.findFirst({
          where: { slug, is_published: true },
        }),
    );
    if (!page) {
      throw new NotFoundException("Page not found");
    }
    return page;
  }

  list(): Promise<ContentPageSummary[]> {
    return this.prisma.contentPage.findMany({
      select: { slug: true, title: true, is_published: true },
      orderBy: { slug: "asc" },
    });
  }

  async update(slug: string, input: ContentPageInput): Promise<ContentPage> {
    const fields = parseContentPageInput(input);
    const data = {
      title: fields.title,
      subtitle: fields.subtitle,
      hero_image_url: fields.hero_image_url,
      sections: fields.sections,
      is_published: fields.is_published,
    };
    const page = await this.prisma.contentPage.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
    await this.redis.del(contentCacheKey(slug));
    return page;
  }
}
