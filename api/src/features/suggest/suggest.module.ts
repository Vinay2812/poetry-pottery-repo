import { Module } from "@nestjs/common";

import { SuggestResolver } from "./suggest.resolver";
import { SuggestService } from "./suggest.service";

@Module({
  providers: [SuggestService, SuggestResolver],
  exports: [SuggestService],
})
export class SuggestModule {}
