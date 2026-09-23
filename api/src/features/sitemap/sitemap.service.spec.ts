import { Test } from "@nestjs/testing";
import { EventStatus } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { releasedProductWhere } from "@/features/products/products.service";
import { PrismaService } from "@/prisma/prisma.service";
import { SitemapService } from "./sitemap.service";

const updatedAt = new Date("2026-09-01T00:00:00.000Z");

const prismaMock = {
  product: { findMany: vi.fn() },
  event: { findMany: vi.fn() },
  workshopConfig: { findMany: vi.fn() },
};

describe("SitemapService", () => {
  let service: SitemapService;

  beforeEach(async () => {
    vi.clearAllMocks();
    // The release rule compares against now, so the clock is pinned for exact matches.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(updatedAt);
    const moduleRef = await Test.createTestingModule({
      providers: [
        SitemapService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = moduleRef.get(SitemapService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lists every slug a visitor can open, with its last change", async () => {
    prismaMock.product.findMany.mockResolvedValue([
      { slug: "moss-mug", updated_at: updatedAt },
    ]);
    prismaMock.event.findMany.mockResolvedValue([
      { slug: "open-mic", updated_at: updatedAt },
    ]);
    prismaMock.workshopConfig.findMany.mockResolvedValue([
      { slug: "wheel-hour", updated_at: updatedAt },
    ]);

    await expect(service.entries()).resolves.toEqual({
      products: [{ slug: "moss-mug", updated_at: updatedAt }],
      events: [{ slug: "open-mic", updated_at: updatedAt }],
      workshops: [{ slug: "wheel-hour", updated_at: updatedAt }],
    });
  });

  it("lists every released piece, archived ones included, since each still has a page", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.workshopConfig.findMany.mockResolvedValue([]);

    await service.entries();

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      select: { slug: true, updated_at: true },
      where: releasedProductWhere(),
      orderBy: { id: "asc" },
    });
  });

  it("leaves cancelled and draft events and paused workshops out", async () => {
    prismaMock.product.findMany.mockResolvedValue([]);
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.workshopConfig.findMany.mockResolvedValue([]);

    await service.entries();

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: { in: [EventStatus.PUBLISHED, EventStatus.COMPLETED] },
        },
      }),
    );
    expect(prismaMock.workshopConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { is_active: true } }),
    );
  });
});
