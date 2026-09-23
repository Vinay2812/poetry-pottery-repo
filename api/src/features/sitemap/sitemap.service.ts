import { Injectable } from "@nestjs/common";
import { EventStatus } from "@prisma/client";

import { releasedProductWhere } from "@/features/products/products.service";
import { PrismaService } from "@/prisma/prisma.service";

import type { Sitemap } from "./sitemap.type";

// Crawlers index what a visitor can open: every released piece (archived ones included), public events and live workshops.
@Injectable()
export class SitemapService {
  constructor(private readonly prisma: PrismaService) {}

  async entries(): Promise<Sitemap> {
    const select = { slug: true, updated_at: true } as const;
    const [products, events, workshops] = await Promise.all([
      this.prisma.product.findMany({
        select,
        where: releasedProductWhere(),
        orderBy: { id: "asc" },
      }),
      this.prisma.event.findMany({
        select,
        where: {
          status: { in: [EventStatus.PUBLISHED, EventStatus.COMPLETED] },
        },
        orderBy: { starts_at: "desc" },
      }),
      this.prisma.workshopConfig.findMany({
        select,
        where: { is_active: true },
        orderBy: { id: "asc" },
      }),
    ]);
    return { products, events, workshops };
  }
}
