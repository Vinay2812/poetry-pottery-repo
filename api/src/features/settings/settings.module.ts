import { Module } from "@nestjs/common";

import { SettingsResolver } from "./settings.resolver";
import { SettingsService } from "./settings.service";

@Module({
  providers: [SettingsService, SettingsResolver],
  exports: [SettingsService],
})
export class SettingsModule {}
