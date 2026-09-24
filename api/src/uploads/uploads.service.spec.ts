import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UploadPurpose as StoredPurpose } from "@prisma/client";
import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { QueueService } from "@/queue/queue.service";
import { StorageService } from "@/storage/storage.service";
import { checkImage, orientedSize } from "./image-specs";
import {
  MAX_UNCLAIMED_PER_OWNER,
  NOT_OWN_UPLOAD,
  UploadsService,
} from "./uploads.service";
import { UploadPurpose } from "./uploads.type";

const CDN = "https://cdn.example.com";

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

function avif(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 190, b: 175 },
    },
  })
    .avif({ quality: 40 })
    .toBuffer();
}

// A phone photo: the pixels sit one way round and the EXIF tag says to show them the other.
function turnedJpeg(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 190, b: 175 },
    },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();
}

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const prismaMock = {
  afterCommit: vi.fn((fn: () => Promise<void> | void) => Promise.resolve(fn())),
  withTransaction: vi.fn(<T>(fn: () => Promise<T>) => fn()),
  upload: {
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    deleteMany: vi.fn(),
  },
  review: { count: vi.fn() },
  cartItem: { count: vi.fn() },
  orderItem: { count: vi.fn() },
  commissionRequest: { count: vi.fn() },
};

const storageMock = {
  isEnabled: true,
  readObject: vi.fn(),
  deleteObject: vi.fn(),
  publicUrlFor: vi.fn((key: string) => `${CDN}/${key}`),
  keyFor: vi.fn((url: string) =>
    url.startsWith(`${CDN}/`) ? url.slice(CDN.length + 1) : null,
  ),
  createImageUpload: vi.fn(),
};

const queueMock = { publish: vi.fn(), publishDelayed: vi.fn() };

const uploadRow = (overrides: Record<string, unknown> = {}) => ({
  key: "reviews/7/a.jpg",
  owner_id: 7,
  purpose: StoredPurpose.REVIEW,
  width: null,
  height: null,
  bytes: null,
  confirmed_at: null,
  claimed_at: null,
  created_at: new Date("2026-09-17T12:00:00.000Z"),
  ...overrides,
});

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

  it("swaps the sides for a quarter-turn exif orientation", () => {
    expect(orientedSize({ width: 1200, height: 900, orientation: 6 })).toEqual({
      width: 900,
      height: 1200,
    });
    expect(orientedSize({ width: 1200, height: 900, orientation: 3 })).toEqual({
      width: 1200,
      height: 900,
    });
    expect(orientedSize({ width: 1200, height: 900 })).toEqual({
      width: 1200,
      height: 900,
    });
  });

  it("accepts an avif, which sharp reports as heif compressed with av1", () => {
    expect(
      checkImage(UploadPurpose.HERO, {
        width: 1600,
        height: 900,
        format: "heif",
        compression: "av1",
        bytes: 1000,
      }),
    ).toBeNull();
  });

  it("rejects a heic, which is heif without the av1 compression", () => {
    expect(
      checkImage(UploadPurpose.HERO, {
        width: 1600,
        height: 900,
        format: "heif",
        compression: "hevc",
        bytes: 1000,
      }),
    ).toMatch(/JPEG, PNG, WebP or AVIF/);
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
    prismaMock.upload.count.mockResolvedValue(0);
    prismaMock.upload.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.upload.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.review.count.mockResolvedValue(0);
    prismaMock.cartItem.count.mockResolvedValue(0);
    prismaMock.orderItem.count.mockResolvedValue(0);
    prismaMock.commissionRequest.count.mockResolvedValue(0);
    storageMock.createImageUpload.mockResolvedValue({
      upload_url: "https://upload.test/put",
      public_url: `${CDN}/reviews/7/a.jpg`,
      key: "reviews/7/a.jpg",
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StorageService, useValue: storageMock },
        { provide: QueueService, useValue: queueMock },
      ],
    }).compile();
    service = moduleRef.get(UploadsService);
  });

  it("lists a spec for every console purpose", () => {
    expect(service.specs()).toHaveLength(Object.values(UploadPurpose).length);
  });

  describe("issue", () => {
    it("presigns under the purpose's folder and the owner, records the row and schedules the expiry", async () => {
      const target = await service.issue(7, StoredPurpose.REVIEW, {
        filename: "a.jpg",
        content_type: "image/jpeg",
        size: 2048,
      });

      expect(target.key).toBe("reviews/7/a.jpg");
      expect(storageMock.createImageUpload).toHaveBeenCalledWith({
        folder: "reviews",
        subfolder: "7",
        filename: "a.jpg",
        content_type: "image/jpeg",
        size: 2048,
      });
      expect(prismaMock.upload.create).toHaveBeenCalledWith({
        data: {
          key: "reviews/7/a.jpg",
          owner_id: 7,
          purpose: StoredPurpose.REVIEW,
        },
      });
      expect(queueMock.publishDelayed).toHaveBeenCalledWith("upload.expire", {
        key: "reviews/7/a.jpg",
      });
    });

    it("sends reference photos to the customization folder and console images to theirs", async () => {
      await service.issue(7, StoredPurpose.REFERENCE, {
        filename: "reference.png",
        content_type: "image/png",
        size: 10,
      });
      await service.issue(3, StoredPurpose.EVENT, {
        filename: "event.webp",
        content_type: "image/webp",
        size: 10,
      });

      expect(storageMock.createImageUpload).toHaveBeenNthCalledWith(
        1,
        containing({ folder: "customization", subfolder: "7" }),
      );
      expect(storageMock.createImageUpload).toHaveBeenNthCalledWith(
        2,
        containing({ folder: "events", subfolder: "3" }),
      );
    });

    it("refuses someone hoarding presigned photos, and signs nothing", async () => {
      prismaMock.upload.count.mockResolvedValue(MAX_UNCLAIMED_PER_OWNER);

      await expect(
        service.issue(7, StoredPurpose.REVIEW, {
          filename: "a.jpg",
          content_type: "image/jpeg",
          size: 2048,
        }),
      ).rejects.toThrow("waiting to be used");

      expect(prismaMock.upload.count).toHaveBeenCalledWith({
        where: { owner_id: 7, purpose: StoredPurpose.REVIEW, claimed_at: null },
      });
      expect(storageMock.createImageUpload).not.toHaveBeenCalled();
      expect(prismaMock.upload.create).not.toHaveBeenCalled();
      expect(queueMock.publishDelayed).not.toHaveBeenCalled();
    });
  });

  describe("claim", () => {
    it("stamps the owner's own rows for that purpose", async () => {
      prismaMock.upload.updateMany.mockResolvedValue({ count: 2 });

      await service.claim(7, StoredPurpose.REVIEW, [
        `${CDN}/reviews/7/a.jpg`,
        `${CDN}/reviews/7/b.jpg`,
        `${CDN}/reviews/7/a.jpg`,
      ]);

      expect(prismaMock.upload.updateMany).toHaveBeenCalledWith({
        where: {
          key: { in: ["reviews/7/a.jpg", "reviews/7/b.jpg"] },
          owner_id: 7,
          purpose: StoredPurpose.REVIEW,
        },
        data: { claimed_at: expect.any(Date) as Date },
      });
    });

    it("refuses when a row is missing, someone else's or for another purpose", async () => {
      prismaMock.upload.updateMany.mockResolvedValue({ count: 1 });

      await expect(
        service.claim(7, StoredPurpose.REVIEW, [
          `${CDN}/reviews/7/a.jpg`,
          `${CDN}/reviews/8/theirs.jpg`,
        ]),
      ).rejects.toThrow(NOT_OWN_UPLOAD);
    });

    it("refuses a url outside the bucket before touching the database", async () => {
      await expect(
        service.claim(7, StoredPurpose.REVIEW, [
          "https://elsewhere.test/a.jpg",
        ]),
      ).rejects.toThrow(NOT_OWN_UPLOAD);
      expect(prismaMock.upload.updateMany).not.toHaveBeenCalled();
    });

    it("skips urls the row already holds and does nothing for an empty list", async () => {
      await service.claim(
        7,
        StoredPurpose.REVIEW,
        [`${CDN}/reviews/7/old.jpg`],
        [`${CDN}/reviews/7/old.jpg`],
      );
      await service.claim(7, StoredPurpose.REVIEW, []);

      expect(prismaMock.upload.updateMany).not.toHaveBeenCalled();
    });
  });

  describe("release", () => {
    it("waits for the commit, then deletes a row and object nothing holds", async () => {
      prismaMock.upload.findUnique.mockResolvedValue(uploadRow());

      await service.release([`${CDN}/reviews/7/a.jpg`]);

      expect(prismaMock.afterCommit).toHaveBeenCalledTimes(1);
      expect(prismaMock.upload.deleteMany).toHaveBeenCalledWith({
        where: { key: "reviews/7/a.jpg", claimed_at: null },
      });
      expect(queueMock.publish).toHaveBeenCalledWith("storage.delete-object", {
        key: "reviews/7/a.jpg",
      });
    });

    it("keeps a review photo another review still shows", async () => {
      prismaMock.upload.findUnique.mockResolvedValue(uploadRow());
      prismaMock.review.count.mockResolvedValue(1);

      await service.release([`${CDN}/reviews/7/a.jpg`]);

      expect(prismaMock.upload.deleteMany).not.toHaveBeenCalled();
      expect(queueMock.publish).not.toHaveBeenCalled();
    });

    it("keeps a reference photo while a cart line, an order item or a brief holds it", async () => {
      const row = uploadRow({
        key: "customization/7/a.jpg",
        purpose: StoredPurpose.REFERENCE,
      });
      prismaMock.upload.findUnique.mockResolvedValue(row);
      const url = `${CDN}/customization/7/a.jpg`;

      prismaMock.cartItem.count.mockResolvedValueOnce(1);
      await service.release([url]);
      prismaMock.orderItem.count.mockResolvedValueOnce(1);
      await service.release([url]);
      prismaMock.commissionRequest.count.mockResolvedValueOnce(1);
      await service.release([url]);
      expect(prismaMock.upload.deleteMany).not.toHaveBeenCalled();

      await service.release([url]);
      expect(prismaMock.cartItem.count).toHaveBeenLastCalledWith({
        where: {
          selections: { path: ["reference_image_urls"], array_contains: [url] },
        },
      });
      expect(prismaMock.upload.deleteMany).toHaveBeenCalledTimes(1);
      expect(queueMock.publish).toHaveBeenCalledWith("storage.delete-object", {
        key: "customization/7/a.jpg",
      });
    });

    it("never deletes a console image, whose holders it does not track", async () => {
      prismaMock.upload.findUnique.mockResolvedValue(
        uploadRow({
          key: "products/3/one.png",
          purpose: StoredPurpose.PRODUCT,
        }),
      );

      await service.release([`${CDN}/products/3/one.png`]);

      expect(prismaMock.upload.deleteMany).not.toHaveBeenCalled();
    });

    it("leaves the object alone when the row was re-claimed under it", async () => {
      prismaMock.upload.findUnique.mockResolvedValue(uploadRow());
      prismaMock.upload.deleteMany.mockResolvedValue({ count: 0 });

      await service.release([`${CDN}/reviews/7/a.jpg`]);

      expect(queueMock.publish).not.toHaveBeenCalled();
    });

    it("ignores urls with no row and urls outside the bucket", async () => {
      prismaMock.upload.findUnique.mockResolvedValue(null);

      await service.release([
        `${CDN}/reviews/7/gone.jpg`,
        "https://elsewhere.test/a.jpg",
      ]);

      expect(prismaMock.upload.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.upload.deleteMany).not.toHaveBeenCalled();
      expect(queueMock.publish).not.toHaveBeenCalled();
    });
  });

  describe("expire", () => {
    it("deletes the row and the object when nothing claimed it", async () => {
      prismaMock.upload.deleteMany.mockResolvedValue({ count: 1 });

      await expect(service.expire("reviews/7/a.jpg")).resolves.toBe(true);

      expect(prismaMock.withTransaction).toHaveBeenCalled();
      expect(prismaMock.upload.deleteMany).toHaveBeenCalledWith({
        where: { key: "reviews/7/a.jpg", claimed_at: null },
      });
      expect(storageMock.deleteObject).toHaveBeenCalledWith("reviews/7/a.jpg");
    });

    it("leaves a claimed upload, or one already gone, alone", async () => {
      prismaMock.upload.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.expire("reviews/7/a.jpg")).resolves.toBe(false);

      expect(storageMock.deleteObject).not.toHaveBeenCalled();
    });

    it("fails inside the transaction when the bucket refuses, so the row delete rolls back", async () => {
      prismaMock.upload.deleteMany.mockResolvedValue({ count: 1 });
      storageMock.deleteObject.mockRejectedValueOnce(new Error("r2 refused"));

      await expect(service.expire("reviews/7/a.jpg")).rejects.toThrow(
        "r2 refused",
      );
      expect(prismaMock.withTransaction).toHaveBeenCalled();
    });
  });

  describe("confirm", () => {
    beforeEach(() => {
      prismaMock.upload.findUnique.mockResolvedValue({
        purpose: StoredPurpose.PRODUCT,
      });
    });

    it("records a matching upload and returns its public url", async () => {
      storageMock.readObject.mockResolvedValue(await png(1000, 1000));

      const result = await service.confirm(
        "products/3/one.png",
        UploadPurpose.PRODUCT,
      );

      expect(result.public_url).toBe(`${CDN}/products/3/one.png`);
      expect(result.width).toBe(1000);
      expect(prismaMock.upload.update).toHaveBeenCalledWith({
        where: { key: "products/3/one.png" },
        data: {
          width: 1000,
          height: 1000,
          bytes: expect.any(Number) as number,
          confirmed_at: expect.any(Date) as Date,
        },
      });
      expect(storageMock.deleteObject).not.toHaveBeenCalled();
    });

    it("confirms an avif instead of deleting it", async () => {
      storageMock.readObject.mockResolvedValue(await avif(1000, 1000));

      const result = await service.confirm(
        "products/3/one.avif",
        UploadPurpose.PRODUCT,
      );

      expect(result.width).toBe(1000);
      expect(storageMock.deleteObject).not.toHaveBeenCalled();
      expect(prismaMock.upload.update).toHaveBeenCalled();
    });

    it("measures a rotated phone photo the way a browser will show it", async () => {
      prismaMock.upload.findUnique.mockResolvedValue({
        purpose: StoredPurpose.EVENT,
      });
      storageMock.readObject.mockResolvedValue(await turnedJpeg(900, 1200));

      const result = await service.confirm(
        "events/3/one.jpg",
        UploadPurpose.EVENT,
      );

      expect(result.width).toBe(1200);
      expect(result.height).toBe(900);
    });

    it("rejects a photo that only fits the spec before its exif turn", async () => {
      prismaMock.upload.findUnique.mockResolvedValue({
        purpose: StoredPurpose.EVENT,
      });
      storageMock.readObject.mockResolvedValue(await turnedJpeg(1200, 900));

      await expect(
        service.confirm("events/3/two.jpg", UploadPurpose.EVENT),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("deletes the object and its row when the upload misses the spec", async () => {
      storageMock.readObject.mockResolvedValue(await png(800, 600));

      await expect(
        service.confirm("products/3/small.png", UploadPurpose.PRODUCT),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(storageMock.deleteObject).toHaveBeenCalledWith(
        "products/3/small.png",
      );
      expect(prismaMock.upload.deleteMany).toHaveBeenCalledWith({
        where: { key: "products/3/small.png" },
      });
      expect(prismaMock.upload.update).not.toHaveBeenCalled();
    });

    it("rejects a key issued for another purpose, or never issued, without reading it", async () => {
      await expect(
        service.confirm("products/3/one.png", UploadPurpose.EVENT),
      ).rejects.toThrow("does not belong to this purpose");

      prismaMock.upload.findUnique.mockResolvedValue(null);
      await expect(
        service.confirm("products/3/one.png", UploadPurpose.PRODUCT),
      ).rejects.toThrow("does not belong to this purpose");

      expect(storageMock.readObject).not.toHaveBeenCalled();
    });
  });

  describe("claimConfirmed", () => {
    it("claims urls that passed the spec check for that purpose", async () => {
      prismaMock.upload.updateMany.mockResolvedValue({ count: 1 });

      await service.claimConfirmed(
        [`${CDN}/products/3/one.png`],
        [],
        UploadPurpose.PRODUCT,
      );

      expect(prismaMock.upload.updateMany).toHaveBeenCalledWith({
        where: {
          key: { in: ["products/3/one.png"] },
          purpose: StoredPurpose.PRODUCT,
          confirmed_at: { not: null },
        },
        data: { claimed_at: expect.any(Date) as Date },
      });
    });

    it("rejects an unconfirmed url and a foreign host", async () => {
      await expect(
        service.claimConfirmed(
          [`${CDN}/products/3/two.png`],
          [],
          UploadPurpose.PRODUCT,
        ),
      ).rejects.toThrow("never confirmed");
      await expect(
        service.claimConfirmed(
          ["https://elsewhere.example.com/a.png"],
          [],
          UploadPurpose.PRODUCT,
        ),
      ).rejects.toThrow("uploaded through the console");
    });

    it("grandfathers urls already saved on the row being edited", async () => {
      await service.claimConfirmed(
        [`${CDN}/products/3/old.png`],
        [`${CDN}/products/3/old.png`],
        UploadPurpose.PRODUCT,
      );

      expect(prismaMock.upload.updateMany).not.toHaveBeenCalled();
    });

    it("skips the check entirely when storage is not configured", async () => {
      storageMock.isEnabled = false;

      await service.claimConfirmed(
        ["https://elsewhere.example.com/a.png"],
        [],
        UploadPurpose.PRODUCT,
      );

      expect(prismaMock.upload.updateMany).not.toHaveBeenCalled();
    });
  });
});
