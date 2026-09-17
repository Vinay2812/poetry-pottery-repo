import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthGuard } from "@/common/guards/auth.guard";
import { PendingUploadsService } from "./pending-uploads.service";
import { StorageResolver } from "./storage.resolver";
import { StorageService } from "./storage.service";

const TICKET = {
  upload_url: "https://r2.test/signed",
  public_url: "https://cdn.test/customization/7/1-abcd-reference.jpg",
  key: "customization/7/1-abcd-reference.jpg",
};

const storageMock = { createImageUpload: vi.fn() };
const pendingMock = { sweep: vi.fn(), track: vi.fn(), keep: vi.fn() };

const user = { db_user_id: 7 } as AuthUser;

describe("StorageResolver", () => {
  let resolver: StorageResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    storageMock.createImageUpload.mockResolvedValue(TICKET);
    const moduleRef = await Test.createTestingModule({
      providers: [
        StorageResolver,
        { provide: StorageService, useValue: storageMock },
        { provide: PendingUploadsService, useValue: pendingMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(StorageResolver);
  });

  it("keys a reference photo under the person who asked for it", async () => {
    await expect(
      resolver.createCustomizationUpload(user, "image/jpeg", 2048),
    ).resolves.toBe(TICKET);

    expect(storageMock.createImageUpload).toHaveBeenCalledWith({
      folder: "customization",
      subfolder: "7",
      filename: "reference.jpg",
      content_type: "image/jpeg",
      size: 2048,
    });
  });

  it("sweeps what this person abandoned, then tracks the key it just signed", async () => {
    await resolver.createCustomizationUpload(user, "image/png", 2048);

    expect(pendingMock.sweep).toHaveBeenCalledWith(7);
    expect(pendingMock.track).toHaveBeenCalledWith(7, TICKET.key);
    expect(pendingMock.sweep.mock.invocationCallOrder[0]).toBeLessThan(
      pendingMock.track.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("refuses a type the studio cannot read, and signs or tracks nothing", async () => {
    await expect(
      resolver.createCustomizationUpload(user, "image/avif", 2048),
    ).rejects.toThrow("Reference photos must be JPEG, PNG or WebP");

    expect(storageMock.createImageUpload).not.toHaveBeenCalled();
    expect(pendingMock.sweep).not.toHaveBeenCalled();
    expect(pendingMock.track).not.toHaveBeenCalled();
  });
});
