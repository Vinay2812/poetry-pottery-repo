import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class VisitWindow {
  @Field()
  starts_at!: Date;

  @Field()
  ends_at!: Date;

  @Field()
  is_available!: boolean;

  @Field(() => String, { nullable: true })
  reason!: string | null;
}

@ObjectType()
export class VisitDay {
  @Field()
  date!: string;

  @Field(() => Int)
  weekday!: number;

  @Field()
  is_closed!: boolean;

  @Field(() => String, { nullable: true })
  reason!: string | null;

  @Field(() => [VisitWindow])
  windows!: VisitWindow[];
}

@ObjectType()
export class StudioVisit {
  @Field()
  id!: string;

  @Field()
  starts_at!: Date;

  @Field()
  ends_at!: Date;

  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field(() => String, { nullable: true })
  note!: string | null;
}

@InputType()
export class StudioVisitInput {
  @Field()
  starts_at!: Date;

  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field(() => String, { nullable: true })
  note?: string | null;
}
