import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import type { SiteSettings } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SettingsResolver } from "./settings.resolver";
import { SettingsService } from "./settings.service";

function guardsOn(prototype: object, field: string): unknown[] {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    prototype,
    field,
  )?.value;
  // A misspelt field would otherwise look like an unguarded one.
  if (typeof handler !== "function") {
    throw new Error(`${field} is not a resolver field`);
  }
  const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, handler);
  return Array.isArray(guards) ? (guards as unknown[]) : [];
}

function makeSettings(overrides: Partial<SiteSettings> = {}): SiteSettings {
  return {
    id: 1,
    contact_phone: "9876543210",
    whatsapp_number: "9876543210",
    contact_email: "studio@example.com",
    address: "1 Kiln Lane, Sangli",
    opening_hours: "10am - 6pm",
    instagram_url: "https://instagram.com/studio",
    facebook_url: "https://facebook.com/studio",
    youtube_url: "https://youtube.com/@studio",
    shipping_flat_fee: 80,
    free_shipping_above: 2000,
    announcement_text: null,
    announcement_href: null,
    hero_heading: "Made by hand",
    hero_subheading: "Thrown in small batches",
    hero_image_url: "https://images.example.com/hero.jpg",
    hero_cta_text: "Shop the shelf",
    hero_cta_href: "/shop",
    updated_at: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

const settingsMock = {
  get: vi.fn<SettingsService["get"]>(),
};

describe("SettingsResolver", () => {
  let resolver: SettingsResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SettingsResolver,
        { provide: SettingsService, useValue: settingsMock },
      ],
    }).compile();
    resolver = moduleRef.get(SettingsResolver);
  });

  it("returns the stored settings without arguments", async () => {
    const settings = makeSettings();
    settingsMock.get.mockResolvedValue(settings);

    await expect(resolver.siteSettings()).resolves.toBe(settings);
    expect(settingsMock.get).toHaveBeenCalledWith();
  });

  it("asks the service again on every read so admin edits show up", async () => {
    settingsMock.get.mockResolvedValue(makeSettings());

    await resolver.siteSettings();
    await resolver.siteSettings();

    expect(settingsMock.get).toHaveBeenCalledTimes(2);
  });

  it("leaves the shop's own details open to anyone", () => {
    expect(guardsOn(SettingsResolver.prototype, "siteSettings")).toEqual([]);
  });
});
