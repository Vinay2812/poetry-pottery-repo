import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";

export enum UploadPurpose {
  PRODUCT = "PRODUCT",
  CATEGORY = "CATEGORY",
  COLLECTION = "COLLECTION",
  EVENT = "EVENT",
  HERO = "HERO",
  CONTENT = "CONTENT",
  REVIEW = "REVIEW",
}

registerEnumType(UploadPurpose, { name: "UploadPurpose" });

@ObjectType()
export class ImageSpec {
  @Field(() => UploadPurpose)
  purpose!: UploadPurpose;

  @Field()
  ratio_label!: string;

  // Null for review photos, which accept any shape.
  @Field(() => Float, { nullable: true })
  ratio!: number | null;

  @Field(() => Int)
  min_width!: number;

  @Field(() => Int)
  min_height!: number;

  @Field(() => Int)
  max_bytes!: number;

  @Field(() => [String])
  content_types!: string[];

  @Field()
  renders_at!: string;
}

@ObjectType()
export class ConfirmedImage {
  @Field()
  key!: string;

  @Field()
  public_url!: string;

  @Field(() => Int)
  width!: number;

  @Field(() => Int)
  height!: number;

  @Field(() => Int)
  bytes!: number;
}
