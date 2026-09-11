import { Injectable } from "@nestjs/common";
import {
  type HealthIndicatorResult,
  HealthIndicatorService,
} from "@nestjs/terminus";

import { QueueService } from "@/queue/queue.service";

@Injectable()
export class QueueHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly queue: QueueService,
  ) {}

  pingCheck<Key extends string>(key: Key): HealthIndicatorResult<Key> {
    const check = this.healthIndicatorService.check(key);
    return this.queue.isConnected
      ? check.up()
      : check.down("rabbitmq disconnected");
  }
}
