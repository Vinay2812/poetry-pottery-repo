import { Test } from "@nestjs/testing";
import { UploadPurpose } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthGuard } from "@/common/guards/auth.guard";
import { UploadsResolver } from "./uploads.resolver";
import { UploadsService } from "./uploads.service";

const TICKET = {
  upload_url: "https://r2.test/signed",
  public_url: "https://cdn.test/customization/7/1-abcd-reference.jpg",
  key: "customization/7/1-abcd-reference.jpg",
};

const uploadsMock = { issue: vi.fn<UploadsService["issue"]>() };

const user = { db_user_id: 7 } as AuthUser;

describe("UploadsResolver", () => {
  let resolver: UploadsResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    uploadsMock.issue.mockResolvedValue(TICKET);
    const moduleRef = await Test.createTestingModule({
      providers: [
        UploadsResolver,
        { provide: UploadsService, useValue: uploadsMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(UploadsResolver);
  });

  it("issues a reference photo to the person who asked for it", async () => {
    await expect(
      resolver.createCustomizationUpload(user, "image/jpeg", 2048),
    ).resolves.toBe(TICKET);

    expect(uploadsMock.issue).toHaveBeenCalledWith(7, UploadPurpose.REFERENCE, {
      filename: "reference.jpg",
      content_type: "image/jpeg",
      size: 2048,
    });
  });

  it("refuses a type the studio cannot read, and issues nothing", async () => {
    await expect(
      resolver.createCustomizationUpload(user, "image/avif", 2048),
    ).rejects.toThrow("Reference photos must be JPEG, PNG or WebP");

    expect(uploadsMock.issue).not.toHaveBeenCalled();
  });
});
