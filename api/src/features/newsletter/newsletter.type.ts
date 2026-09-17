import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class NewsletterResult {
  @Field()
  email!: string;

  @Field()
  is_active!: boolean;

  @Field()
  was_already_subscribed!: boolean;
}

@ObjectType()
export class NewsletterStatus {
  @Field()
  is_subscribed!: boolean;

  @Field(() => String, { nullable: true })
  email!: string | null;
}
