import { Module } from "@nestjs/common";

import { WorkshopsModule } from "@/features/workshops/workshops.module";
import { AdminWorkshopsResolver } from "./workshops.resolver";
import { AdminWorkshopsService } from "./workshops.service";

@Module({
  imports: [WorkshopsModule],
  providers: [AdminWorkshopsService, AdminWorkshopsResolver],
})
export class AdminWorkshopsModule {}
