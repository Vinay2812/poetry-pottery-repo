import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SitemapEntry {
  @Field()
  slug!: string;

  @Field()
  updated_at!: Date;
}

@ObjectType()
export class Sitemap {
  @Field(() => [SitemapEntry])
  products!: SitemapEntry[];

  @Field(() => [SitemapEntry])
  events!: SitemapEntry[];

  @Field(() => [SitemapEntry])
  workshops!: SitemapEntry[];
}
