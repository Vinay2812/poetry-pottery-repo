import { Module } from "@nestjs/common";

import { AdminUploadsResolver } from "./uploads.resolver";
import { UploadsService } from "./uploads.service";

@Module({
  providers: [UploadsService, AdminUploadsResolver],
  exports: [UploadsService],
})
export class AdminUploadsModule {}
