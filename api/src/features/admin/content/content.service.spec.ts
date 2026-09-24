import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { RedisService } from "@/redis/redis.service";
import { ContentService } from "@/features/content/content.service";
import { SettingsService } from "@/features/settings/settings.service";
import { UploadsService } from "@/uploads/uploads.service";
import { AdminContentService } from "./content.service";
import { UploadPurpose } from "@/uploads/uploads.type";

const pageRow = {
  slug: "about",
  title: "Our story",
  subtitle: null,
  hero_image_url: null,
  sections: [],
  is_published: false,
  updated_at: new Date(),
};

const prismaMock = {
  contentPage: { findUnique: vi.fn(), delete: vi.fn() },
};
const contentMock = { list: vi.fn(), update: vi.fn() };
const settingsMock = { get: vi.fn(), update: vi.fn() };
const redisMock = { del: vi.fn() };
const uploadsMock = { claimConfirmed: vi.fn() };

describe("AdminContentService", () => {
  let service: AdminContentService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.contentPage.findUnique.mockResolvedValue(pageRow);
    contentMock.update.mockResolvedValue(pageRow);
    contentMock.list.mockResolvedValue([]);
    settingsMock.get.mockResolvedValue({
      hero_image_url: "",
      dispatch_days_min: 7,
      dispatch_days_max: 12,
    });
    settingsMock.update.mockResolvedValue({});
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminContentService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ContentService, useValue: contentMock },
        { provide: SettingsService, useValue: settingsMock },
        { provide: RedisService, useValue: redisMock },
        { provide: UploadsService, useValue: uploadsMock },
      ],
    }).compile();
    service = moduleRef.get(AdminContentService);
  });

  it("returns unpublished pages to the console", async () => {
    await expect(service.page("about")).resolves.toMatchObject({
      is_published: false,
    });
  });

  it("reports a missing page", async () => {
    prismaMock.contentPage.findUnique.mockResolvedValue(null);

    await expect(service.page("nope")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("normalises the slug and delegates the sections to the zod schema", async () => {
    await service.savePage("About Us", { title: "Our story", sections: [] });

    expect(contentMock.update).toHaveBeenCalledWith("about-us", {
      title: "Our story",
      sections: [],
    });
  });

  it("checks the hero image against the content spec", async () => {
    await service.savePage("about", {
      title: "Our story",
      sections: [],
      hero_image_url: "https://cdn.example.com/content/a.png",
    });

    expect(uploadsMock.claimConfirmed).toHaveBeenCalledWith(
      ["https://cdn.example.com/content/a.png"],
      [],
      UploadPurpose.CONTENT,
    );
  });

  it("clears the cache when a page is deleted", async () => {
    await expect(service.deletePage("about")).resolves.toBe(true);

    expect(redisMock.del).toHaveBeenCalledWith("content:about");
  });

  it("normalises the slug before deleting, so it hits the row it saved", async () => {
    await expect(service.deletePage("About Us")).resolves.toBe(true);

    expect(prismaMock.contentPage.delete).toHaveBeenCalledWith({
      where: { slug: "about-us" },
    });
    expect(redisMock.del).toHaveBeenCalledWith("content:about-us");
  });

  it("refuses a negative shipping fee", async () => {
    await expect(
      service.updateSettings({ shipping_flat_fee: -1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("only writes the settings fields that were sent", async () => {
    await service.updateSettings({ contact_phone: " 9123456789 " });

    expect(settingsMock.update).toHaveBeenCalledWith({
      contact_phone: "9123456789",
    });
  });

  it("saves a dispatch window that reads forwards", async () => {
    await service.updateSettings({
      dispatch_days_min: 5,
      dispatch_days_max: 9,
    });

    expect(settingsMock.update).toHaveBeenCalledWith({
      dispatch_days_min: 5,
      dispatch_days_max: 9,
    });
  });

  it("refuses a dispatch window that ends before it starts", async () => {
    await expect(
      service.updateSettings({ dispatch_days_min: 14, dispatch_days_max: 3 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("checks one end of the dispatch window against the stored other end", async () => {
    await expect(
      service.updateSettings({ dispatch_days_min: 20 }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.updateSettings({ dispatch_days_max: 20 }),
    ).resolves.toBeDefined();
  });

  it("takes the announcement bar down and drops its link", async () => {
    await service.updateAnnouncement({ text: "  ", href: "/shop" });

    expect(settingsMock.update).toHaveBeenCalledWith({
      announcement_text: null,
      announcement_href: null,
    });
  });

  it("keeps the link when the bar carries text", async () => {
    await service.updateAnnouncement({ text: "Monsoon batch", href: "/shop" });

    expect(settingsMock.update).toHaveBeenCalledWith({
      announcement_text: "Monsoon batch",
      announcement_href: "/shop",
    });
  });
});
