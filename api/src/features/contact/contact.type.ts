import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

import { PageInfo } from "@/common/pagination/pagination";

@ObjectType()
export class ContactMessage {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Field(() => String, { nullable: true })
  subject!: string | null;

  @Field()
  message!: string;

  @Field()
  is_read!: boolean;

  @Field()
  created_at!: Date;
}

@ObjectType()
export class ContactMessagesResult {
  @Field(() => [ContactMessage])
  items!: ContactMessage[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class ContactMessageInput {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  subject?: string | null;

  @Field()
  message!: string;
}
