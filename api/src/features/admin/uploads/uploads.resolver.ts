import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { UploadTarget } from "@/features/reviews/reviews.type";
import { UploadsService } from "./uploads.service";
import { ConfirmedImage, ImageSpec, UploadPurpose } from "./uploads.type";

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
    @Args("purpose", { type: () => UploadPurpose }) purpose: UploadPurpose,
    @Args("content_type") contentType: string,
    @Args("size", { type: () => Int }) size: number,
  ): Promise<UploadTarget> {
    return this.uploads.createUpload(purpose, contentType, size);
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
