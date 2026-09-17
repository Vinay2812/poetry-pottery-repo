import { Global, Module } from "@nestjs/common";

import { PendingUploadsService } from "./pending-uploads.service";
import { StorageConsumer } from "./storage.consumer";
import { StorageResolver } from "./storage.resolver";
import { StorageService } from "./storage.service";

@Global()
@Module({
  providers: [
    StorageService,
    PendingUploadsService,
    StorageResolver,
    StorageConsumer,
  ],
  exports: [StorageService, PendingUploadsService],
})
export class StorageModule {}
