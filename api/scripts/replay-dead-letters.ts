import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { PrismaModule } from "@/prisma/prisma.module";
import {
  ATTEMPT_HEADER,
  DEAD_LETTER_QUEUE,
  QUEUE_EXCHANGE,
} from "@/queue/jobs";
import { QueueModule } from "@/queue/queue.module";

// Only the broker and its one dependency: no resolvers, consumers or Redis come up for a replay.
@Module({ imports: [PrismaModule, QueueModule] })
class ReplayModule {}

// The slice of the AMQP channel a replay uses; amqplib's own types are not resolvable here.
interface DeadLetter {
  content: Buffer;
  fields: { routingKey: string };
  properties: {
    headers?: Record<string, unknown>;
    contentType?: string;
    contentEncoding?: string;
  };
}

interface BrokerChannel {
  get(queue: string, options: { noAck: boolean }): Promise<DeadLetter | false>;
  publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options: {
      persistent: boolean;
      contentType?: string;
      contentEncoding?: string;
      headers: Record<string, unknown>;
    },
  ): boolean;
  ack(msg: DeadLetter): void;
}

// Hands every dead-lettered message back to its original routing key with a fresh attempt budget:
// `pnpm queue:replay`. Fix the cause first, or the same messages come straight back.
async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(ReplayModule, {
    logger: ["error", "warn"],
  });
  try {
    const amqp = app.get(AmqpConnection);
    const managed = amqp.managedChannel as { waitForConnect(): Promise<void> };
    await managed.waitForConnect();
    const channel = amqp.channel as BrokerChannel;
    let replayed = 0;
    for (;;) {
      const msg = await channel.get(DEAD_LETTER_QUEUE, { noAck: false });
      if (msg === false) break;
      const headers = { ...msg.properties.headers };
      delete headers[ATTEMPT_HEADER];
      channel.publish(QUEUE_EXCHANGE, msg.fields.routingKey, msg.content, {
        persistent: true,
        contentType: msg.properties.contentType,
        contentEncoding: msg.properties.contentEncoding,
        headers,
      });
      channel.ack(msg);
      replayed += 1;
    }
    process.stdout.write(`Replayed ${replayed} dead-lettered messages\n`);
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.stack : String(error)}\n`,
  );
  process.exitCode = 1;
});
