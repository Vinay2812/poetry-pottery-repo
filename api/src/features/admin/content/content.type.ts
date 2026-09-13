import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class AdminSiteSettingsInput {
  @Field(() => String, { nullable: true })
  contact_phone?: string | null;

  @Field(() => String, { nullable: true })
  whatsapp_number?: string | null;

  @Field(() => String, { nullable: true })
  contact_email?: string | null;

  @Field(() => String, { nullable: true })
  address?: string | null;

  @Field(() => String, { nullable: true })
  opening_hours?: string | null;

  @Field(() => String, { nullable: true })
  instagram_url?: string | null;

  @Field(() => String, { nullable: true })
  facebook_url?: string | null;

  @Field(() => String, { nullable: true })
  youtube_url?: string | null;

  @Field(() => Int, { nullable: true })
  shipping_flat_fee?: number | null;

  @Field(() => Int, { nullable: true })
  free_shipping_above?: number | null;

  @Field(() => String, { nullable: true })
  hero_heading?: string | null;

  @Field(() => String, { nullable: true })
  hero_subheading?: string | null;

  @Field(() => String, { nullable: true })
  hero_image_url?: string | null;

  @Field(() => String, { nullable: true })
  hero_cta_text?: string | null;

  @Field(() => String, { nullable: true })
  hero_cta_href?: string | null;
}

@InputType()
export class AdminAnnouncementInput {
  // Empty text takes the bar down.
  @Field(() => String, { nullable: true })
  text?: string | null;

  @Field(() => String, { nullable: true })
  href?: string | null;
}
