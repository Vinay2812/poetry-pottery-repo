import { Injectable } from "@nestjs/common";
import type { Prisma, SiteSettings } from "@prisma/client";

import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";

const CACHE_KEY = "settings:site";
const CACHE_TTL_SECONDS = 60;

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // The migration inserts the singleton row, so a missing row is a real fault.
  get(): Promise<SiteSettings> {
    return this.redis.getOrSet(CACHE_KEY, CACHE_TTL_SECONDS, () =>
      this.prisma.siteSettings.findUniqueOrThrow({ where: { id: 1 } }),
    );
  }

  async update(data: Prisma.SiteSettingsUpdateInput): Promise<SiteSettings> {
    const settings = await this.prisma.siteSettings.update({
      where: { id: 1 },
      data,
    });
    await this.redis.del(CACHE_KEY);
    return settings;
  }
}
