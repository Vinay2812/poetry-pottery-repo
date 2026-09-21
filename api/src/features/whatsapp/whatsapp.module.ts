import { Module } from "@nestjs/common";

import { AuthGuard } from "@/common/guards/auth.guard";
import { WhatsAppResolver } from "./whatsapp.resolver";
import { WhatsAppService } from "./whatsapp.service";

@Module({
  providers: [WhatsAppService, WhatsAppResolver, AuthGuard],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
