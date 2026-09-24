import { Module } from "@nestjs/common";

import { ContentModule } from "@/features/content/content.module";
import { SettingsModule } from "@/features/settings/settings.module";
import { AdminContentResolver } from "./content.resolver";
import { AdminContentService } from "./content.service";

@Module({
  imports: [ContentModule, SettingsModule],
  providers: [AdminContentService, AdminContentResolver],
})
export class AdminContentModule {}
