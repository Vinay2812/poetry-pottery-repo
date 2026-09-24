import { Module } from "@nestjs/common";

import { AuthGuard } from "@/common/guards/auth.guard";

import { WorkshopsResolver } from "./workshops.resolver";
import { WorkshopsService } from "./workshops.service";

@Module({
  providers: [WorkshopsService, WorkshopsResolver, AuthGuard],
  exports: [WorkshopsService],
})
export class WorkshopsModule {}
