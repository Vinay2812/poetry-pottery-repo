import { Query, Resolver } from "@nestjs/graphql";

import { SettingsService } from "./settings.service";
import { SiteSettings } from "./settings.type";

@Resolver(() => SiteSettings)
export class SettingsResolver {
  constructor(private readonly settings: SettingsService) {}

  @Query(() => SiteSettings)
  siteSettings(): Promise<SiteSettings> {
    return this.settings.get();
  }
}
