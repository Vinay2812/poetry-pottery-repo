import { Module } from "@nestjs/common";

import { ContentResolver } from "./content.resolver";
import { ContentService } from "./content.service";

@Module({
  providers: [ContentService, ContentResolver],
  exports: [ContentService],
})
export class ContentModule {}
