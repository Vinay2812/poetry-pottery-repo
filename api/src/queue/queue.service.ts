import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";

import { PrismaService } from "@/prisma/prisma.service";
import { type JobName, type JobPayload, QUEUE_EXCHANGE } from "./jobs";

@Injectable()
export class QueueService {
  constructor(
    private readonly amqp: AmqpConnection,
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  get isConnected(): boolean {
    return this.amqp.connected;
  }

  // Inside a transaction the job waits for the commit, so a consumer never reads a row that
  // may still roll back. Publishing never throws into request handlers: a job the broker
  // refused was never on it, so it is logged here rather than dead-lettered.
  publish<Name extends JobName>(
    job: Name,
    payload: JobPayload<Name>,
  ): Promise<void> {
    return this.prisma.afterCommit(() => this.send(job, payload));
  }

  private async send<Name extends JobName>(
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
        payload_keys: Object.keys(payload),
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
