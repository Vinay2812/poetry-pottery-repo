import { Global, Module } from "@nestjs/common";

import { StorageResolver } from "./storage.resolver";
import { StorageService } from "./storage.service";

@Global()
@Module({
  providers: [StorageService, StorageResolver],
  exports: [StorageService],
})
export class StorageModule {}
