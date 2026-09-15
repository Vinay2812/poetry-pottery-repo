import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { StorageService } from "@/storage/storage.service";
import { checkImage } from "./image-specs";
import { UploadsService } from "./uploads.service";
import { UploadPurpose } from "./uploads.type";

function png(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 190, b: 175 },
    },
  })
    .png()
    .toBuffer();
}

const prismaMock = {
  confirmedUpload: { upsert: vi.fn(), findMany: vi.fn() },
};

const storageMock = {
  isEnabled: true,
  readObject: vi.fn(),
  deleteObject: vi.fn(),
  publicUrlFor: vi.fn((key: string) => `https://cdn.example.com/${key}`),
  keyFromUrl: vi.fn((url: string) =>
    url.startsWith("https://cdn.example.com/")
      ? url.slice("https://cdn.example.com/".length)
      : null,
  ),
  createImageUpload: vi.fn(),
};

describe("checkImage", () => {
  it("accepts a square product photo at the minimum size", () => {
    expect(
      checkImage(UploadPurpose.PRODUCT, {
        width: 1000,
        height: 1000,
        format: "jpeg",
        bytes: 1000,
      }),
    ).toBeNull();
  });

  it("rejects a product photo that is too small", () => {
    expect(
      checkImage(UploadPurpose.PRODUCT, {
        width: 800,
        height: 800,
        format: "jpeg",
        bytes: 1000,
      }),
    ).toMatch(/at least 1000 × 1000/);
  });

  it("allows a ratio two percent off the spec", () => {
    expect(
      checkImage(UploadPurpose.COLLECTION, {
        width: 1212,
        height: 800,
        format: "webp",
        bytes: 1000,
      }),
    ).toBeNull();
  });

  it("rejects a ratio further off than the tolerance", () => {
    expect(
      checkImage(UploadPurpose.COLLECTION, {
        width: 1400,
        height: 800,
        format: "webp",
        bytes: 1000,
      }),
    ).toMatch(/must be 3:2/);
  });

  it("only checks the shortest side for review photos", () => {
    expect(
      checkImage(UploadPurpose.REVIEW, {
        width: 2000,
        height: 400,
        format: "png",
        bytes: 1000,
      }),
    ).toBeNull();
    expect(
      checkImage(UploadPurpose.REVIEW, {
        width: 2000,
        height: 320,
        format: "png",
        bytes: 1000,
      }),
    ).toMatch(/shortest side/);
  });

  it("rejects an unsupported format and an oversized file", () => {
    expect(
      checkImage(UploadPurpose.HERO, {
        width: 1600,
        height: 900,
        format: "gif",
        bytes: 1000,
      }),
    ).toMatch(/JPEG, PNG, WebP or AVIF/);
    expect(
      checkImage(UploadPurpose.HERO, {
        width: 1600,
        height: 900,
        format: "jpeg",
        bytes: 9_000_000,
      }),
    ).toMatch(/under 8 MB/);
  });
});

describe("UploadsService", () => {
  let service: UploadsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    storageMock.isEnabled = true;
    const moduleRef = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile();
    service = moduleRef.get(UploadsService);
  });

  it("lists a spec for every purpose", () => {
    expect(service.specs()).toHaveLength(Object.values(UploadPurpose).length);
  });

  it("presigns into the folder that matches the purpose", async () => {
    storageMock.createImageUpload.mockResolvedValue({
      upload_url: "u",
      public_url: "p",
      key: "k",
    });

    await service.createUpload(UploadPurpose.EVENT, "image/webp", 1024);

    expect(storageMock.createImageUpload).toHaveBeenCalledWith({
      folder: "events",
      filename: "event.webp",
      content_type: "image/webp",
      size: 1024,
    });
  });

  it("refuses a content type outside the allow list", async () => {
    await expect(
      service.createUpload(UploadPurpose.PRODUCT, "image/gif", 1024),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("records a matching upload and returns its public url", async () => {
    storageMock.readObject.mockResolvedValue(await png(1000, 1000));

    const result = await service.confirm(
      "products/one.png",
      UploadPurpose.PRODUCT,
    );

    expect(result.public_url).toBe("https://cdn.example.com/products/one.png");
    expect(result.width).toBe(1000);
    expect(prismaMock.confirmedUpload.upsert).toHaveBeenCalled();
    expect(storageMock.deleteObject).not.toHaveBeenCalled();
  });

  it("deletes and rejects an upload that misses the spec", async () => {
    storageMock.readObject.mockResolvedValue(await png(800, 600));

    await expect(
      service.confirm("products/small.png", UploadPurpose.PRODUCT),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(storageMock.deleteObject).toHaveBeenCalledWith("products/small.png");
    expect(prismaMock.confirmedUpload.upsert).not.toHaveBeenCalled();
  });

  it("rejects a key from another purpose's folder", async () => {
    await expect(
      service.confirm("events/one.png", UploadPurpose.PRODUCT),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("passes urls that were confirmed", async () => {
    prismaMock.confirmedUpload.findMany.mockResolvedValue([
      { key: "products/one.png" },
    ]);

    await expect(
      service.assertConfirmed(["https://cdn.example.com/products/one.png"]),
    ).resolves.toBeUndefined();
  });

  it("rejects an unconfirmed url and a foreign host", async () => {
    prismaMock.confirmedUpload.findMany.mockResolvedValue([]);

    await expect(
      service.assertConfirmed(["https://cdn.example.com/products/two.png"]),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.assertConfirmed(["https://elsewhere.example.com/a.png"]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("grandfathers urls already saved on the row being edited", async () => {
    await service.assertConfirmed(
      ["https://cdn.example.com/products/old.png"],
      ["https://cdn.example.com/products/old.png"],
    );

    expect(prismaMock.confirmedUpload.findMany).not.toHaveBeenCalled();
  });

  it("skips the check entirely when storage is not configured", async () => {
    storageMock.isEnabled = false;

    await service.assertConfirmed(["https://elsewhere.example.com/a.png"]);

    expect(prismaMock.confirmedUpload.findMany).not.toHaveBeenCalled();
  });
});
