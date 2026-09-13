import { Module } from "@nestjs/common";

import { WorkshopsResolver } from "./workshops.resolver";
import { WorkshopsService } from "./workshops.service";

@Module({
  providers: [WorkshopsService, WorkshopsResolver],
  exports: [WorkshopsService],
})
export class WorkshopsModule {}
