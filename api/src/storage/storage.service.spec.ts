import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BadRequestException } from "@nestjs/common";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { env } from "@/config/env";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  StorageService,
  UPLOAD_FOLDERS,
  type UploadFolder,
} from "./storage.service";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(function (this: { send: typeof sendMock }) {
    this.send = sendMock;
  }),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl: vi.fn() }));

vi.mock("@/config/env", async () => {
  const actual =
    await vi.importActual<typeof import("@/config/env")>("@/config/env");
  return {
    ...actual,
    env: actual.buildEnv({
      ...process.env,
      R2_ACCOUNT_ID: "acc-1",
      R2_ACCESS_KEY_ID: "key-1",
      R2_SECRET_ACCESS_KEY: "secret-1",
      R2_BUCKET: "poetry-media",
      // The trailing slash is deliberate: the service has to trim it.
      R2_PUBLIC_URL: "https://media.poetry.test/",
    }),
  };
});

const clientMock = vi.mocked(S3Client);
const commandMock = vi.mocked(PutObjectCommand);
const deleteCommandMock = vi.mocked(DeleteObjectCommand);
const presign = vi.mocked(getSignedUrl);

const SIGNED_URL = "https://acc-1.r2.cloudflarestorage.com/poetry-media/signed";
const NOW = new Date("2026-09-17T04:30:00.000Z");

function upload(
  overrides: Partial<{
    folder: UploadFolder;
    filename: string;
    content_type: string;
    size: number;
  }> = {},
): {
  folder: UploadFolder;
  filename: string;
  content_type: string;
  size: number;
} {
  return {
    folder: "products",
    filename: "chai-mug.jpg",
    content_type: "image/jpeg",
    size: 2048,
    ...overrides,
  };
}

const r2 = {
  accountId: env.R2_ACCOUNT_ID,
  bucket: env.R2_BUCKET,
  publicUrl: env.R2_PUBLIC_URL,
};

describe("StorageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    presign.mockResolvedValue(SIGNED_URL);
  });

  afterEach(() => {
    env.R2_ACCOUNT_ID = r2.accountId;
    env.R2_BUCKET = r2.bucket;
    env.R2_PUBLIC_URL = r2.publicUrl;
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("points the client at the configured Cloudflare account", () => {
    new StorageService();

    expect(clientMock).toHaveBeenCalledWith({
      region: "auto",
      endpoint: "https://acc-1.r2.cloudflarestorage.com",
      credentials: { accessKeyId: "key-1", secretAccessKey: "secret-1" },
    });
  });

  it("presigns a PUT against the configured bucket and a foldered key", async () => {
    const service = new StorageService();

    const target = await service.createImageUpload(upload());

    expect(target.key).toMatch(
      new RegExp(`^products/${NOW.getTime()}-[0-9a-f]{8}-chai-mug\\.jpg$`),
    );
    expect(commandMock).toHaveBeenCalledWith({
      Bucket: "poetry-media",
      Key: target.key,
      ContentType: "image/jpeg",
      ContentLength: 2048,
    });
    expect(presign).toHaveBeenCalledWith(
      expect.any(S3Client),
      expect.any(PutObjectCommand),
      { expiresIn: 600, signableHeaders: new Set(["content-type"]) },
    );
    expect(target.upload_url).toBe(SIGNED_URL);
  });

  it("builds the public url from R2_PUBLIC_URL without doubling the slash", async () => {
    const service = new StorageService();

    const target = await service.createImageUpload(upload());

    expect(target.public_url).toBe(`https://media.poetry.test/${target.key}`);
  });

  it("keys each upload under the folder it was asked for", async () => {
    const service = new StorageService();

    for (const folder of UPLOAD_FOLDERS) {
      const target = await service.createImageUpload(upload({ folder }));
      expect(target.key.startsWith(`${folder}/`)).toBe(true);
    }
  });

  it("beats a shouty filename into a safe slug", async () => {
    const service = new StorageService();

    const target = await service.createImageUpload(
      upload({ filename: "Chai Mug (Large)~#2.JPEG" }),
    );

    expect(target.key).toMatch(/-chai-mug-large-2\.jpeg$/);
  });

  it("keeps the tail of an absurdly long filename", async () => {
    const service = new StorageService();

    const target = await service.createImageUpload(
      upload({ filename: `${"a".repeat(200)}-tail.png` }),
    );

    const [, name] = target.key.split(/-[0-9a-f]{8}-/);
    expect(name).toHaveLength(80);
    expect(name?.endsWith("-tail.png")).toBe(true);
  });

  it("accepts every image type the storefront renders", async () => {
    const service = new StorageService();

    for (const content_type of ALLOWED_IMAGE_TYPES) {
      await expect(
        service.createImageUpload(upload({ content_type })),
      ).resolves.toMatchObject({ upload_url: SIGNED_URL });
    }
    expect(presign).toHaveBeenCalledTimes(ALLOWED_IMAGE_TYPES.length);
  });

  it("refuses a type that is not one of the four, and signs nothing", async () => {
    const service = new StorageService();

    for (const content_type of [
      "image/gif",
      "image/svg+xml",
      "application/pdf",
      "text/html",
      "",
    ]) {
      await expect(
        service.createImageUpload(upload({ content_type })),
      ).rejects.toThrow(BadRequestException);
    }
    expect(presign).not.toHaveBeenCalled();
    expect(commandMock).not.toHaveBeenCalled();
  });

  it("names the allowed types when it turns one away", async () => {
    const service = new StorageService();

    await expect(
      service.createImageUpload(upload({ content_type: "image/gif" })),
    ).rejects.toThrow("Only JPEG, PNG, WebP and AVIF images are allowed");
  });

  it("accepts an image sitting exactly on the 8 MB ceiling", async () => {
    const service = new StorageService();

    await expect(
      service.createImageUpload(upload({ size: MAX_IMAGE_BYTES })),
    ).resolves.toMatchObject({ upload_url: SIGNED_URL });
  });

  it("refuses an oversized, empty or negative upload, and signs nothing", async () => {
    const service = new StorageService();

    for (const size of [MAX_IMAGE_BYTES + 1, 50 * 1024 * 1024, 0, -1]) {
      await expect(service.createImageUpload(upload({ size }))).rejects.toThrow(
        "Images must be under 8 MB",
      );
    }
    expect(presign).not.toHaveBeenCalled();
    expect(commandMock).not.toHaveBeenCalled();
  });

  it("recognises its own public urls and nothing else", () => {
    const service = new StorageService();

    expect(service.isOwnUrl("https://media.poetry.test/products/mug.jpg")).toBe(
      true,
    );
    expect(service.isOwnUrl("https://media.poetry.test")).toBe(false);
    expect(service.isOwnUrl("https://media.poetry.test.evil/products/x")).toBe(
      false,
    );
    expect(service.isOwnUrl("https://evil.test/products/mug.jpg")).toBe(false);
    expect(service.isOwnUrl("")).toBe(false);
  });

  it("stays switched off, and claims no urls, when R2 is half-configured", async () => {
    env.R2_BUCKET = undefined;
    const service = new StorageService();

    expect(service.isEnabled).toBe(false);
    expect(clientMock).not.toHaveBeenCalled();
    expect(service.isOwnUrl("https://media.poetry.test/products/mug.jpg")).toBe(
      false,
    );
    await expect(service.createImageUpload(upload())).rejects.toThrow(
      "Image uploads are not configured",
    );
    expect(presign).not.toHaveBeenCalled();
  });

  it("reports itself enabled once every R2 value is present", () => {
    expect(new StorageService().isEnabled).toBe(true);
  });

  it("reads the object key back out of its own public url", () => {
    const service = new StorageService();

    expect(
      service.keyFor("https://media.poetry.test/customization/7/a.jpg"),
    ).toBe("customization/7/a.jpg");
    expect(service.keyFor("https://media.poetry.test/")).toBeNull();
    expect(
      service.keyFor("https://evil.test/customization/7/a.jpg"),
    ).toBeNull();
  });

  it("deletes an object from the configured bucket", async () => {
    const service = new StorageService();

    await service.deleteObject("customization/7/a.jpg");

    expect(deleteCommandMock).toHaveBeenCalledWith({
      Bucket: "poetry-media",
      Key: "customization/7/a.jpg",
    });
    expect(sendMock).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
  });

  it("has nothing to delete when R2 is not configured", async () => {
    env.R2_BUCKET = undefined;
    const service = new StorageService();

    await expect(
      service.deleteObject("customization/7/a.jpg"),
    ).resolves.toBeUndefined();
    expect(deleteCommandMock).not.toHaveBeenCalled();
  });
});
