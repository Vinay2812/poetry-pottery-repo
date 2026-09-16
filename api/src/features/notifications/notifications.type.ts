import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BatchNotificationResult {
  @Field()
  email!: string;

  @Field()
  was_already_waiting!: boolean;
}
