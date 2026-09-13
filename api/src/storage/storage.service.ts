import { randomBytes } from "node:crypto";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BadRequestException, Injectable } from "@nestjs/common";

import { env } from "@/config/env";

export const UPLOAD_FOLDERS = [
  "products",
  "events",
  "collections",
  "categories",
  "content",
  "hero",
  "reviews",
  "customization",
  "orders",
] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const URL_TTL_SECONDS = 600;

export interface UploadTarget {
  upload_url: string;
  public_url: string;
  key: string;
}

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
}

function readR2Config(): R2Config | null {
  if (
    !env.R2_ACCOUNT_ID ||
    !env.R2_ACCESS_KEY_ID ||
    !env.R2_SECRET_ACCESS_KEY ||
    !env.R2_BUCKET ||
    !env.R2_PUBLIC_URL
  ) {
    return null;
  }
  return {
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET,
    publicUrl: env.R2_PUBLIC_URL.replace(/\/$/, ""),
  };
}

@Injectable()
export class StorageService {
  private readonly config = readR2Config();
  private readonly client: S3Client | null;

  constructor() {
    this.client = this.config
      ? new S3Client({
          region: "auto",
          endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey,
          },
        })
      : null;
  }

  get isEnabled(): boolean {
    return this.client !== null;
  }

  // User-supplied image URLs are only accepted when they point at our own bucket.
  isOwnUrl(url: string): boolean {
    return this.config !== null && url.startsWith(`${this.config.publicUrl}/`);
  }

  publicUrlFor(key: string): string {
    if (!this.config) {
      throw new BadRequestException("Image uploads are not configured");
    }
    return `${this.config.publicUrl}/${key}`;
  }

  // The object key behind one of our own public urls, or null for anyone else's.
  keyFor(url: string): string | null {
    if (!this.config || !this.isOwnUrl(url)) return null;
    return url.slice(this.config.publicUrl.length + 1) || null;
  }

  // Reads the stored object back so the API can verify what actually landed in the bucket.
  async readObject(key: string): Promise<Buffer> {
    if (!this.client || !this.config) {
      throw new BadRequestException("Image uploads are not configured");
    }
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
    if (!result.Body) {
      throw new BadRequestException("That upload is no longer in the bucket");
    }
    return Buffer.from(await result.Body.transformToByteArray());
  }

  async deleteObject(key: string): Promise<void> {
    if (!this.client || !this.config) return;
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
  }

  async createImageUpload(input: {
    folder: UploadFolder;
    subfolder?: string;
    filename: string;
    content_type: string;
    size: number;
  }): Promise<UploadTarget> {
    if (!this.client || !this.config) {
      throw new BadRequestException("Image uploads are not configured");
    }
    if (!ALLOWED_IMAGE_TYPES.some((type) => type === input.content_type)) {
      throw new BadRequestException(
        "Only JPEG, PNG, WebP and AVIF images are allowed",
      );
    }
    if (input.size <= 0 || input.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException("Images must be under 8 MB");
    }

    const safeName = input.filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .slice(-80);
    const prefix = input.subfolder
      ? `${input.folder}/${input.subfolder}`
      : input.folder;
    const key = `${prefix}/${Date.now()}-${randomBytes(4).toString("hex")}-${safeName}`;
    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ContentType: input.content_type,
      ContentLength: input.size,
    });
    const upload_url = await getSignedUrl(this.client, command, {
      expiresIn: URL_TTL_SECONDS,
    });

    return { upload_url, public_url: `${this.config.publicUrl}/${key}`, key };
  }
}
