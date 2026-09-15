import { Args, Query, Resolver } from "@nestjs/graphql";

import { ContentService } from "./content.service";
import { ContentPage } from "./content.type";

@Resolver(() => ContentPage)
export class ContentResolver {
  constructor(private readonly content: ContentService) {}

  @Query(() => ContentPage)
  contentPage(@Args("slug") slug: string): Promise<ContentPage> {
    return this.content.bySlug(slug);
  }
}
