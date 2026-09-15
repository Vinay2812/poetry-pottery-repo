import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";

import { AdminRequired } from "@/common/decorators/auth.decorators";
import { ContentService } from "./content.service";
import {
  ContentPage,
  ContentPageInput,
  ContentPageSummary,
} from "./content.type";

@Resolver(() => ContentPage)
export class ContentResolver {
  constructor(private readonly content: ContentService) {}

  @Query(() => ContentPage)
  contentPage(@Args("slug") slug: string): Promise<ContentPage> {
    return this.content.bySlug(slug);
  }

  @AdminRequired()
  @Query(() => [ContentPageSummary])
  contentPages(): Promise<ContentPageSummary[]> {
    return this.content.list();
  }

  @AdminRequired()
  @Mutation(() => ContentPage)
  updateContentPage(
    @Args("slug") slug: string,
    @Args("input") input: ContentPageInput,
  ): Promise<ContentPage> {
    return this.content.update(slug, input);
  }
}
