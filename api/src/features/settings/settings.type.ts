import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SiteSettings {
  @Field()
  contact_phone!: string;

  @Field()
  whatsapp_number!: string;

  @Field()
  contact_email!: string;

  @Field()
  address!: string;

  @Field()
  opening_hours!: string;

  @Field()
  instagram_url!: string;

  @Field()
  facebook_url!: string;

  @Field()
  youtube_url!: string;

  @Field(() => Int)
  shipping_flat_fee!: number;

  @Field(() => Int, { nullable: true })
  free_shipping_above!: number | null;

  @Field(() => Int)
  dispatch_days_min!: number;

  @Field(() => Int)
  dispatch_days_max!: number;

  @Field(() => String, { nullable: true })
  announcement_text!: string | null;

  @Field(() => String, { nullable: true })
  announcement_href!: string | null;

  @Field()
  hero_heading!: string;

  @Field()
  hero_subheading!: string;

  @Field()
  hero_image_url!: string;

  @Field()
  hero_cta_text!: string;

  @Field()
  hero_cta_href!: string;

  @Field()
  updated_at!: Date;
}
