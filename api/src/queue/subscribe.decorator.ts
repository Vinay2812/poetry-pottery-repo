import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";

import {
  DEAD_LETTER_EXCHANGE,
  type JobName,
  QUEUE_EXCHANGE,
  queueNameFor,
} from "./jobs";

// One durable queue per job, bound to the topic exchange and dead-lettered on failure.
export function SubscribeJob(job: JobName): MethodDecorator {
  return RabbitSubscribe({
    exchange: QUEUE_EXCHANGE,
    routingKey: job,
    queue: queueNameFor(job),
    queueOptions: {
      durable: true,
      deadLetterExchange: DEAD_LETTER_EXCHANGE,
    },
  });
}
