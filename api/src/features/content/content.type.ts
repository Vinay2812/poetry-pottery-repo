import { Field, InputType, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ContentSectionItem {
  @Field()
  title!: string;

  @Field()
  body!: string;
}

@ObjectType()
export class ContentSection {
  @Field()
  heading!: string;

  @Field()
  body!: string;

  @Field(() => [ContentSectionItem])
  items!: ContentSectionItem[];
}

@ObjectType()
export class ContentPage {
  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  subtitle!: string | null;

  @Field(() => String, { nullable: true })
  hero_image_url!: string | null;

  @Field(() => [ContentSection])
  sections!: ContentSection[];

  @Field()
  is_published!: boolean;

  @Field()
  updated_at!: Date;
}

@ObjectType()
export class ContentPageSummary {
  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field()
  is_published!: boolean;
}

@InputType()
export class ContentSectionItemInput {
  @Field()
  title!: string;

  @Field()
  body!: string;
}

@InputType()
export class ContentSectionInput {
  @Field()
  heading!: string;

  @Field()
  body!: string;

  @Field(() => [ContentSectionItemInput], { nullable: true })
  items?: ContentSectionItemInput[] | null;
}

@InputType()
export class ContentPageInput {
  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  subtitle?: string | null;

  @Field(() => String, { nullable: true })
  hero_image_url?: string | null;

  @Field(() => [ContentSectionInput])
  sections!: ContentSectionInput[];

  @Field(() => Boolean, { nullable: true })
  is_published?: boolean | null;
}
