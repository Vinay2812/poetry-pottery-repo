import { Global, Module } from "@nestjs/common";

import { UploadsConsumer } from "./uploads.consumer";
import { UploadsResolver } from "./uploads.resolver";
import { UploadsService } from "./uploads.service";

@Global()
@Module({
  providers: [UploadsService, UploadsConsumer, UploadsResolver],
  exports: [UploadsService],
})
export class UploadsModule {}
