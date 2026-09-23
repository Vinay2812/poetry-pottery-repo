import { Query, Resolver } from "@nestjs/graphql";

import { SitemapService } from "./sitemap.service";
import { Sitemap } from "./sitemap.type";

@Resolver(() => Sitemap)
export class SitemapResolver {
  constructor(private readonly sitemapService: SitemapService) {}

  @Query(() => Sitemap)
  sitemap(): Promise<Sitemap> {
    return this.sitemapService.entries();
  }
}
