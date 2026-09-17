import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Address {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field()
  line1!: string;

  @Field(() => String, { nullable: true })
  line2!: string | null;

  @Field(() => String, { nullable: true })
  landmark!: string | null;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  pincode!: string;

  @Field()
  is_default!: boolean;
}

@InputType()
export class AddressInput {
  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field()
  line1!: string;

  @Field(() => String, { nullable: true })
  line2?: string | null;

  @Field(() => String, { nullable: true })
  landmark?: string | null;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  pincode!: string;

  @Field(() => Boolean, { nullable: true })
  is_default?: boolean | null;
}
