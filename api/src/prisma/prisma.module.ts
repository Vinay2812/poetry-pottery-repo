import { Global, Module } from "@nestjs/common";

import { PrismaService, withAmbientTransactions } from "./prisma.service";

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: (): PrismaService =>
        withAmbientTransactions(new PrismaService()),
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
