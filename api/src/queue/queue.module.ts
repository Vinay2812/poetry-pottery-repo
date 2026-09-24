import {
  MessageHandlerErrorBehavior,
  RabbitMQModule,
} from "@golevelup/nestjs-rabbitmq";
import { Global, Module } from "@nestjs/common";

import { env } from "@/config/env";

const silentLogger = { log() {}, error() {}, warn() {}, debug() {} };
import {
  DEAD_LETTER_EXCHANGE,
  DEAD_LETTER_QUEUE,
  JOB_NAMES,
  QUEUE_EXCHANGE,
  RETRY,
  retryQueueNameFor,
} from "./jobs";
import { QueueService } from "./queue.service";

@Global()
@Module({
  imports: [
    RabbitMQModule.forRoot({
      uri: env.RABBITMQ_URL,
      exchanges: [
        { name: QUEUE_EXCHANGE, type: "topic", options: { durable: true } },
        {
          name: DEAD_LETTER_EXCHANGE,
          type: "fanout",
          options: { durable: true },
        },
      ],
      queues: [
        // Messages that exhausted their attempts land here for inspection and `pnpm queue:replay`.
        {
          name: DEAD_LETTER_QUEUE,
          exchange: DEAD_LETTER_EXCHANGE,
          routingKey: "",
          options: { durable: true },
        },
        // One delay queue per job: a parked message expires back onto the job's own routing key.
        ...JOB_NAMES.map((job) => ({
          name: retryQueueNameFor(job),
          options: {
            durable: true,
            messageTtl: RETRY.delayMs,
            deadLetterExchange: QUEUE_EXCHANGE,
            deadLetterRoutingKey: job,
          },
        })),
      ],
      defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.NACK,
      registerHandlers: env.QUEUE_CONSUMERS_ENABLED && !env.isTest,
      enableControllerDiscovery: false,
      connectionInitOptions: { wait: false },
      prefetchCount: 4,
      ...(env.isTest ? { logger: silentLogger } : {}),
    }),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
