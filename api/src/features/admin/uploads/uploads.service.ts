import { BadRequestException, Injectable } from "@nestjs/common";
import sharp from "sharp";

import { PrismaService } from "@/prisma/prisma.service";
import { StorageService, type UploadTarget } from "@/storage/storage.service";
import {
  ALLOWED_CONTENT_TYPES,
  checkImage,
  extensionFor,
  folderFor,
  IMAGE_SPECS,
  MAX_IMAGE_BYTES,
} from "./image-specs";
import { ConfirmedImage, ImageSpec, UploadPurpose } from "./uploads.type";

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  specs(): ImageSpec[] {
    return Object.values(IMAGE_SPECS);
  }

  async createUpload(
    purpose: UploadPurpose,
    contentType: string,
    size: number,
  ): Promise<UploadTarget> {
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException(
        "Only JPEG, PNG, WebP and AVIF images are allowed",
      );
    }
    if (size <= 0 || size > MAX_IMAGE_BYTES) {
      throw new BadRequestException("Images must be under 8 MB");
    }
    return await this.storage.createImageUpload({
      folder: folderFor(purpose),
      filename: `${purpose.toLowerCase()}.${extensionFor(contentType)}`,
      content_type: contentType,
      size,
    });
  }

  // The browser could have sent anything past the presigned URL, so the stored bytes decide.
  async confirm(key: string, purpose: UploadPurpose): Promise<ConfirmedImage> {
    if (folderFor(purpose) !== key.split("/")[0]) {
      throw new BadRequestException(
        "That upload key does not belong to this purpose",
      );
    }
    const body = await this.storage.readObject(key);
    const meta = await sharp(body)
      .metadata()
      .catch(() => null);
    const problem = meta
      ? checkImage(purpose, {
          width: meta.width,
          height: meta.height,
          format: meta.format,
          bytes: body.byteLength,
        })
      : "That file does not read as an image";
    if (problem) {
      await this.storage.deleteObject(key);
      throw new BadRequestException(problem);
    }

    const record = {
      purpose,
      width: meta?.width ?? 0,
      height: meta?.height ?? 0,
      bytes: body.byteLength,
    };
    await this.prisma.confirmedUpload.upsert({
      where: { key },
      create: { key, ...record },
      update: record,
    });
    return { key, public_url: this.storage.publicUrlFor(key), ...record };
  }

  // Entity writes call this; URLs already saved on the row being edited are grandfathered in.
  async assertConfirmed(
    urls: readonly string[],
    alreadySaved: readonly string[] = [],
    purpose?: UploadPurpose,
  ): Promise<void> {
    // Without R2 there is nothing to verify against, so local development is not blocked.
    if (!this.storage.isEnabled || urls.length === 0) return;
    const saved = new Set(alreadySaved);
    const pending = urls.filter((url) => !saved.has(url));
    if (pending.length === 0) return;

    const keys: string[] = [];
    for (const url of pending) {
      const key = this.storage.keyFor(url);
      if (key === null) {
        throw new BadRequestException(
          "Images must be uploaded through the console",
        );
      }
      keys.push(key);
    }
    // The purpose is part of the match, so a small category tile cannot become a product photo.
    const confirmed = await this.prisma.confirmedUpload.findMany({
      where: { key: { in: keys }, ...(purpose ? { purpose } : {}) },
      select: { key: true },
    });
    const known = new Set(confirmed.map((row) => row.key));
    if (keys.some((key) => !known.has(key))) {
      throw new BadRequestException(
        "One of these images was never confirmed against the size and ratio rules",
      );
    }
  }
}
