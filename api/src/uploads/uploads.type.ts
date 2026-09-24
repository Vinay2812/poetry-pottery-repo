import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import { UploadPurpose as StoredPurpose } from "@prisma/client";

// The purposes the console presigns for; a shopper's reference photos never come through it.
export const UploadPurpose = {
  PRODUCT: StoredPurpose.PRODUCT,
  CATEGORY: StoredPurpose.CATEGORY,
  GLAZE: StoredPurpose.GLAZE,
  COLLECTION: StoredPurpose.COLLECTION,
  EVENT: StoredPurpose.EVENT,
  HERO: StoredPurpose.HERO,
  CONTENT: StoredPurpose.CONTENT,
  REVIEW: StoredPurpose.REVIEW,
  ORDER_NOTE: StoredPurpose.ORDER_NOTE,
} as const;

export type UploadPurpose = (typeof UploadPurpose)[keyof typeof UploadPurpose];

registerEnumType(UploadPurpose, { name: "UploadPurpose" });

@ObjectType()
export class UploadTicket {
  @Field()
  upload_url!: string;

  @Field()
  public_url!: string;

  @Field()
  key!: string;
}

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
