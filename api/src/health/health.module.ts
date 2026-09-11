import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { HealthController } from "./health.controller";
import { PrismaHealthIndicator } from "./prisma.health";
import { QueueHealthIndicator } from "./queue.health";
import { RedisHealthIndicator } from "./redis.health";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    PrismaHealthIndicator,
    RedisHealthIndicator,
    QueueHealthIndicator,
  ],
})
export class HealthModule {}
