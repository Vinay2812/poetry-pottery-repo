import { Global, Module } from "@nestjs/common";

import { StorageConsumer } from "./storage.consumer";
import { StorageService } from "./storage.service";

@Global()
@Module({
  providers: [StorageService, StorageConsumer],
  exports: [StorageService],
})
export class StorageModule {}
