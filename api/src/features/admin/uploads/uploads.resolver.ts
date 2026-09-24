import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AdminRequired } from "@/common/decorators/auth.decorators";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { UploadTarget } from "@/features/reviews/reviews.type";
import { extensionFor } from "@/uploads/image-specs";
import { UploadsService } from "@/uploads/uploads.service";
import {
  ConfirmedImage,
  ImageSpec,
  UploadPurpose,
} from "@/uploads/uploads.type";

@Resolver(() => ImageSpec)
export class AdminUploadsResolver {
  constructor(private readonly uploads: UploadsService) {}

  @AdminRequired()
  @Query(() => [ImageSpec])
  imageSpecs(): ImageSpec[] {
    return this.uploads.specs();
  }

  @AdminRequired()
  @Mutation(() => UploadTarget)
  createAdminUpload(
    @CurrentUser() user: AuthUser,
    @Args("purpose", { type: () => UploadPurpose }) purpose: UploadPurpose,
    @Args("content_type") contentType: string,
    @Args("size", { type: () => Int }) size: number,
  ): Promise<UploadTarget> {
    return this.uploads.issue(user.db_user_id, purpose, {
      filename: `${purpose.toLowerCase()}.${extensionFor(contentType)}`,
      content_type: contentType,
      size,
    });
  }

  @AdminRequired()
  @Mutation(() => ConfirmedImage)
  confirmUpload(
    @Args("key") key: string,
    @Args("purpose", { type: () => UploadPurpose }) purpose: UploadPurpose,
  ): Promise<ConfirmedImage> {
    return this.uploads.confirm(key, purpose);
  }
}
