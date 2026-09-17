import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UploadTicket {
  @Field()
  upload_url!: string;

  @Field()
  public_url!: string;

  @Field()
  key!: string;
}
