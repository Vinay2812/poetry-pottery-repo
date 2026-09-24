import { BadRequestException, Injectable } from "@nestjs/common";
import { UploadPurpose as StoredPurpose } from "@prisma/client";
import sharp from "sharp";

import { PrismaService } from "@/prisma/prisma.service";
import { QueueService } from "@/queue/queue.service";
import { StorageService, type UploadTarget } from "@/storage/storage.service";
import {
  checkImage,
  folderFor,
  IMAGE_SPECS,
  orientedSize,
} from "./image-specs";
import { ConfirmedImage, ImageSpec, UploadPurpose } from "./uploads.type";

// One person may have this many photos signed but not yet attached to anything, per purpose.
export const MAX_UNCLAIMED_PER_OWNER = 12;
export const TOO_MANY_WAITING =
  "Too many photos are waiting to be used; attach the ones you have first";
export const NOT_OWN_UPLOAD = "That photo was not uploaded through the site";
const NOT_CONSOLE_UPLOAD = "Images must be uploaded through the console";
const NOT_CONFIRMED =
  "One of these images was never confirmed against the size and ratio rules";

export interface UploadFile {
  filename: string;
  content_type: string;
  size: number;
}

// The upload lifecycle behind one interface. A presign issues a row and a delayed expiry job; the
// thing that keeps the photo claims it inside its own transaction; whatever lets go of it releases
// it, and the object is deleted once nothing live holds it. Console images add a spec check on top.
@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly queue: QueueService,
  ) {}

  specs(): ImageSpec[] {
    return Object.values(IMAGE_SPECS);
  }

  async issue(
    ownerId: number,
    purpose: StoredPurpose,
    file: UploadFile,
  ): Promise<UploadTarget> {
    const waiting = await this.prisma.upload.count({
      where: { owner_id: ownerId, purpose, claimed_at: null },
    });
    if (waiting >= MAX_UNCLAIMED_PER_OWNER) {
      throw new BadRequestException(TOO_MANY_WAITING);
    }
    const target = await this.storage.createImageUpload({
      folder: folderFor(purpose),
      subfolder: String(ownerId),
      filename: file.filename,
      content_type: file.content_type,
      size: file.size,
    });
    await this.prisma.upload.create({
      data: { key: target.key, owner_id: ownerId, purpose },
    });
    await this.queue.publishDelayed("upload.expire", { key: target.key });
    return target;
  }

  // Runs in the caller's transaction, so a rollback leaves the photos unclaimed. Only the owner's
  // own uploads for this purpose pass; URLs the row already holds are not checked again.
  async claim(
    ownerId: number,
    purpose: StoredPurpose,
    urls: readonly string[],
    alreadyHeld: readonly string[] = [],
  ): Promise<void> {
    const held = new Set(alreadyHeld);
    const keys = this.keysOf(
      urls.filter((url) => !held.has(url)),
      NOT_OWN_UPLOAD,
    );
    if (keys.length === 0) return;
    const claimed = await this.prisma.upload.updateMany({
      where: { key: { in: keys }, owner_id: ownerId, purpose },
      data: { claimed_at: new Date() },
    });
    if (claimed.count !== keys.length) {
      throw new BadRequestException(NOT_OWN_UPLOAD);
    }
  }

  // Once the caller's transaction has committed, deletes each photo nothing live holds any more.
  release(urls: readonly string[]): Promise<void> {
    const keys = this.ownKeys(urls);
    if (keys.length === 0) return Promise.resolve();
    return this.prisma.afterCommit(async () => {
      for (const key of keys) {
        await this.releaseOne(key);
      }
    });
  }

  // The expiry job: an upload nothing claimed within the day is deleted; a claimed one is left alone.
  async expire(key: string): Promise<boolean> {
    // The row lock holds off a racing claim; a refused bucket delete rolls back so the retry finds the row.
    return this.prisma.withTransaction(async () => {
      const gone = await this.prisma.upload.deleteMany({
        where: { key, claimed_at: null },
      });
      if (gone.count === 0) return false;
      await this.storage.deleteObject(key);
      return true;
    });
  }

  // Console only: the browser could have sent anything past the presigned URL, so the stored bytes decide.
  async confirm(key: string, purpose: UploadPurpose): Promise<ConfirmedImage> {
    const row = await this.prisma.upload.findUnique({
      where: { key },
      select: { purpose: true },
    });
    if (row?.purpose !== purpose) {
      throw new BadRequestException(
        "That upload key does not belong to this purpose",
      );
    }
    const body = await this.storage.readObject(key);
    const meta = await sharp(body)
      .metadata()
      .catch(() => null);
    // Browsers and the image optimiser both honour EXIF, so measure the photo as it will render.
    const size = meta ? orientedSize(meta) : { width: 0, height: 0 };
    const problem = meta
      ? checkImage(purpose, {
          width: size.width,
          height: size.height,
          format: meta.format,
          compression: meta.compression,
          bytes: body.byteLength,
        })
      : "That file does not read as an image";
    if (problem) {
      await this.storage.deleteObject(key);
      await this.prisma.upload.deleteMany({ where: { key } });
      throw new BadRequestException(problem);
    }

    const record = {
      width: size.width ?? 0,
      height: size.height ?? 0,
      bytes: body.byteLength,
    };
    await this.prisma.upload.update({
      where: { key },
      data: { ...record, confirmed_at: new Date() },
    });
    return { key, public_url: this.storage.publicUrlFor(key), ...record };
  }

  // Console entity writes: every new image must have passed the spec check for this purpose, and
  // is claimed here because the row about to be saved will hold it. URLs already saved on that
  // row are grandfathered in. Without R2 there is nothing to verify against, so local development is not blocked.
  async claimConfirmed(
    urls: readonly string[],
    alreadySaved: readonly string[],
    purpose: UploadPurpose,
  ): Promise<void> {
    if (!this.storage.isEnabled) return;
    const saved = new Set(alreadySaved);
    const keys = this.keysOf(
      urls.filter((url) => !saved.has(url)),
      NOT_CONSOLE_UPLOAD,
    );
    if (keys.length === 0) return;
    const claimed = await this.prisma.upload.updateMany({
      where: { key: { in: keys }, purpose, confirmed_at: { not: null } },
      data: { claimed_at: new Date() },
    });
    if (claimed.count !== keys.length) {
      throw new BadRequestException(NOT_CONFIRMED);
    }
  }

  private async releaseOne(key: string): Promise<void> {
    const row = await this.prisma.upload.findUnique({ where: { key } });
    if (!row) return;
    if (await this.isHeld(row.purpose, this.storage.publicUrlFor(key))) return;
    // Conditional on the claim we read, so a line that took the photo back meanwhile keeps it.
    const gone = await this.prisma.upload.deleteMany({
      where: { key, claimed_at: row.claimed_at },
    });
    if (gone.count === 1) {
      await this.queue.publish("storage.delete-object", { key });
    }
  }

  // Where a photo of each purpose can live. Console images are never released, so they always count as held.
  private async isHeld(purpose: StoredPurpose, url: string): Promise<boolean> {
    if (purpose === StoredPurpose.REVIEW) {
      const reviews = await this.prisma.review.count({
        where: { image_urls: { has: url } },
      });
      return reviews > 0;
    }
    if (purpose === StoredPurpose.REFERENCE) {
      const holdsPhoto = {
        selections: { path: ["reference_image_urls"], array_contains: [url] },
      };
      const [lines, items, briefs] = await Promise.all([
        this.prisma.cartItem.count({ where: holdsPhoto }),
        this.prisma.orderItem.count({ where: holdsPhoto }),
        this.prisma.commissionRequest.count({
          where: { reference_image_urls: { has: url } },
        }),
      ]);
      return lines + items + briefs > 0;
    }
    return true;
  }

  // Every URL must be one of ours; the message names the door the caller should have used.
  private keysOf(urls: readonly string[], message: string): string[] {
    const keys = new Set<string>();
    for (const url of urls) {
      const key = this.storage.keyFor(url);
      if (key === null) {
        throw new BadRequestException(message);
      }
      keys.add(key);
    }
    return [...keys];
  }

  private ownKeys(urls: readonly string[]): string[] {
    const keys = new Set<string>();
    for (const url of urls) {
      const key = this.storage.keyFor(url);
      if (key !== null) keys.add(key);
    }
    return [...keys];
  }
}
