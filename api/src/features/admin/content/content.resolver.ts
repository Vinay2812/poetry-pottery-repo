import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import {
  ContentPage,
  ContentPageInput,
  ContentPageSummary,
} from "@/features/content/content.type";
import { SiteSettings } from "@/features/settings/settings.type";
import { AdminContentService } from "./content.service";
import { AdminAnnouncementInput, AdminSiteSettingsInput } from "./content.type";

@Resolver(() => ContentPage)
export class AdminContentResolver {
  constructor(private readonly content: AdminContentService) {}

  @AdminRequired()
  @Query(() => [ContentPageSummary])
  adminContentPages(): Promise<ContentPageSummary[]> {
    return this.content.pages();
  }

  @AdminRequired()
  @Query(() => ContentPage)
  adminContentPage(@Args("slug") slug: string): Promise<ContentPage> {
    return this.content.page(slug);
  }

  @AdminRequired()
  @Mutation(() => ContentPage)
  saveContentPage(
    @Args("slug") slug: string,
    @Args("input") input: ContentPageInput,
  ): Promise<ContentPage> {
    return this.content.savePage(slug, input);
  }

  @AdminRequired()
  @Mutation(() => Boolean)
  deleteContentPage(@Args("slug") slug: string): Promise<boolean> {
    return this.content.deletePage(slug);
  }

  @AdminRequired()
  @Mutation(() => SiteSettings)
  updateSiteSettings(
    @Args("input") input: AdminSiteSettingsInput,
  ): Promise<SiteSettings> {
    return this.content.updateSettings(input);
  }

  @AdminRequired()
  @Mutation(() => SiteSettings)
  updateAnnouncement(
    @Args("input") input: AdminAnnouncementInput,
  ): Promise<SiteSettings> {
    return this.content.updateAnnouncement(input);
  }
}
