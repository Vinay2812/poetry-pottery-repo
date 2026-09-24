import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";

import {
  DEAD_LETTER_EXCHANGE,
  type JobName,
  QUEUE_EXCHANGE,
  queueNameFor,
} from "./jobs";
import { retryOrDeadLetter } from "./retry";

// One durable queue per job, bound to the topic exchange; failures retry through the delay
// queue and are dead-lettered once the attempts run out.
export function SubscribeJob(job: JobName): MethodDecorator {
  return RabbitSubscribe({
    exchange: QUEUE_EXCHANGE,
    routingKey: job,
    queue: queueNameFor(job),
    queueOptions: {
      durable: true,
      deadLetterExchange: DEAD_LETTER_EXCHANGE,
    },
    errorHandler: retryOrDeadLetter(job),
  });
}
