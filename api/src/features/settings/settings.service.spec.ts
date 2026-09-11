import { Test } from "@nestjs/testing";
import type { SiteSettings } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { SettingsService } from "./settings.service";

const settingsRow = { id: 1, shipping_flat_fee: 150 } as SiteSettings;

const prismaMock = {
  siteSettings: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
};

const redisMock = {
  getOrSet: vi.fn(
    (_key: string, _ttl: number, loader: () => Promise<unknown>) => loader(),
  ),
  del: vi.fn(),
};

describe("SettingsService", () => {
  let service: SettingsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
      ],
    }).compile();
    service = moduleRef.get(SettingsService);
  });

  it("reads the singleton row through the cache", async () => {
    prismaMock.siteSettings.findUniqueOrThrow.mockResolvedValue(settingsRow);

    await expect(service.get()).resolves.toEqual(settingsRow);
    expect(redisMock.getOrSet).toHaveBeenCalledWith(
      "settings:site",
      60,
      expect.any(Function),
    );
  });

  it("invalidates the cache after an update", async () => {
    prismaMock.siteSettings.update.mockResolvedValue(settingsRow);

    await service.update({ shipping_flat_fee: 200 });

    expect(prismaMock.siteSettings.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { shipping_flat_fee: 200 },
    });
    expect(redisMock.del).toHaveBeenCalledWith("settings:site");
  });
});
