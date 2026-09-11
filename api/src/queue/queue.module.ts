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
  QUEUE_EXCHANGE,
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
      // Failed messages land in a durable dead-letter queue for inspection and replay.
      queues: [
        {
          name: DEAD_LETTER_QUEUE,
          exchange: DEAD_LETTER_EXCHANGE,
          routingKey: "",
          options: { durable: true },
        },
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
