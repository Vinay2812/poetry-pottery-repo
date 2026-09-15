import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";

import { type JobName, type JobPayload, QUEUE_EXCHANGE } from "./jobs";

@Injectable()
export class QueueService {
  constructor(
    private readonly amqp: AmqpConnection,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  get isConnected(): boolean {
    return this.amqp.connected;
  }

  // Publishing never throws into request handlers; a lost job is logged and can be replayed by an admin.
  async publish<Name extends JobName>(
    job: Name,
    payload: JobPayload<Name>,
  ): Promise<void> {
    try {
      await this.amqp.publish(QUEUE_EXCHANGE, job, payload, {
        persistent: true,
      });
    } catch (error) {
      this.logger.error("queue publish failed", {
        job,
        payload,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
