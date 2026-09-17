import { Module } from "@nestjs/common";

import { VisitsModule } from "@/features/visits/visits.module";
import { AdminVisitsResolver } from "./visits.resolver";
import { AdminVisitsService } from "./visits.service";

@Module({
  imports: [VisitsModule],
  providers: [AdminVisitsService, AdminVisitsResolver],
})
export class AdminVisitsModule {}
