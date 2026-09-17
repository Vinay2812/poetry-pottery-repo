import { Injectable } from "@nestjs/common";
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from "@nestjs/terminus";

import { RedisService } from "@/redis/redis.service";

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly redis: RedisService,
  ) {}

  async pingCheck<Key extends string>(
    key: Key,
  ): Promise<HealthIndicatorResult<Key>> {
    const check = this.healthIndicatorService.check(key);
    try {
      await this.redis.client.ping();
      return check.up();
    } catch (error) {
      return check.down(
        error instanceof Error ? error.message : "redis unreachable",
      );
    }
  }
}
