import { BadRequestException } from "@nestjs/common";
import { Args, Int, Mutation, Resolver } from "@nestjs/graphql";
import { UploadPurpose } from "@prisma/client";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { StrictThrottle } from "@/common/decorators/throttle.decorators";
import { UploadsService } from "./uploads.service";
import { UploadTicket } from "./uploads.type";

const REFERENCE_PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

@Resolver(() => UploadTicket)
export class UploadsResolver {
  constructor(private readonly uploads: UploadsService) {}

  @AuthRequired()
  @StrictThrottle()
  @Mutation(() => UploadTicket)
  async createCustomizationUpload(
    @CurrentUser() user: AuthUser,
    @Args("content_type") content_type: string,
    @Args("size", { type: () => Int }) size: number,
  ): Promise<UploadTicket> {
    const extension = REFERENCE_PHOTO_TYPES[content_type];
    if (!extension) {
      throw new BadRequestException(
        "Reference photos must be JPEG, PNG or WebP",
      );
    }
    return this.uploads.issue(user.db_user_id, UploadPurpose.REFERENCE, {
      filename: `reference.${extension}`,
      content_type,
      size,
    });
  }
}
