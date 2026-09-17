import { Global, Module } from "@nestjs/common";

import { SearchConsumer } from "./search.consumer";
import { SearchService } from "./search.service";

@Global()
@Module({
  providers: [SearchService, SearchConsumer],
  exports: [SearchService],
})
export class SearchModule {}
