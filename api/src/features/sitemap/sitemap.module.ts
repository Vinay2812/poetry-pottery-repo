import { Module } from "@nestjs/common";

import { SitemapResolver } from "./sitemap.resolver";
import { SitemapService } from "./sitemap.service";

@Module({ providers: [SitemapService, SitemapResolver] })
export class SitemapModule {}
