import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";
import { WhatsAppDirection } from "@prisma/client";

import { PageInfo } from "@/common/pagination/pagination";
import { AdminUserRef } from "@/features/admin/admin.type";

registerEnumType(WhatsAppDirection, { name: "WhatsAppDirection" });

@ObjectType()
export class WhatsAppMessage {
  @Field(() => Int)
  id!: number;

  @Field(() => WhatsAppDirection)
  direction!: WhatsAppDirection;

  @Field()
  kind!: string;

  @Field()
  body!: string;

  @Field(() => String, { nullable: true })
  page_url!: string | null;

  @Field(() => String, { nullable: true })
  name!: string | null;

  @Field(() => String, { nullable: true })
  email!: string | null;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Field(() => String, { nullable: true })
  reference!: string | null;

  @Field()
  created_at!: Date;

  @Field(() => AdminUserRef, { nullable: true })
  user!: AdminUserRef | null;
}

@ObjectType()
export class AdminWhatsAppMessagesResult {
  @Field(() => [WhatsAppMessage])
  items!: WhatsAppMessage[];

  @Field(() => PageInfo)
  page_info!: PageInfo;
}

@InputType()
export class RecordWhatsAppMessageInput {
  @Field()
  kind!: string;

  @Field()
  body!: string;

  @Field(() => String, { nullable: true })
  page_url?: string | null;

  @Field(() => String, { nullable: true })
  reference?: string | null;
}

@InputType()
export class SendWhatsAppReplyInput {
  @Field()
  kind!: string;

  @Field()
  body!: string;

  @Field()
  to_email!: string;

  @Field(() => String, { nullable: true })
  to_phone?: string | null;

  @Field(() => String, { nullable: true })
  reference?: string | null;
}

@InputType()
export class AdminWhatsAppFilterInput {
  @Field(() => String, { nullable: true })
  search?: string | null;

  @Field(() => WhatsAppDirection, { nullable: true })
  direction?: WhatsAppDirection | null;

  @Field(() => Int, { nullable: true })
  user_id?: number | null;

  @Field(() => Int, { nullable: true })
  page?: number | null;

  @Field(() => Int, { nullable: true })
  limit?: number | null;
}
