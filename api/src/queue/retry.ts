import { Logger } from "@nestjs/common";
import { ZodError } from "zod";

import { ATTEMPT_HEADER, type JobName, RETRY, retryQueueNameFor } from "./jobs";

const logger = new Logger("Queue");

// The slice of an AMQP delivery the retry loop reads; amqplib's own types are not resolvable here.
export interface RetryMessage {
  content: Buffer;
  properties: {
    headers?: Record<string, unknown>;
    contentType?: string;
    contentEncoding?: string;
    messageId?: string;
  };
}

export interface RetryPublishOptions {
  persistent: boolean;
  contentType?: string;
  contentEncoding?: string;
  messageId?: string;
  headers: Record<string, unknown>;
}

export interface RetryChannel {
  ack(msg: RetryMessage): void;
  nack(msg: RetryMessage, allUpTo: boolean, requeue: boolean): void;
  publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options: RetryPublishOptions,
  ): boolean;
}

export type RetryHandler = (
  channel: RetryChannel,
  msg: RetryMessage,
  error: unknown,
) => void;

// The first delivery is attempt 1; the header only appears once a message has been retried.
export function attemptOf(
  headers: Record<string, unknown> | undefined,
): number {
  const value = headers?.[ATTEMPT_HEADER];
  return typeof value === "number" && value >= 1 ? value : 1;
}

// A malformed payload never becomes valid, so it skips the retry loop.
export function shouldRetry(attempt: number, error: unknown): boolean {
  if (error instanceof ZodError) return false;
  return attempt < RETRY.maxAttempts;
}

// Transient failures go round the delay queue a bounded number of times; the rest are dead-lettered.
export function retryOrDeadLetter(job: JobName): RetryHandler {
  return (channel, msg, error) => {
    const attempt = attemptOf(msg.properties.headers);
    const reason = error instanceof Error ? error.message : String(error);
    if (!shouldRetry(attempt, error)) {
      logger.error(`${job} dead-lettered after attempt ${attempt}: ${reason}`);
      channel.nack(msg, false, false);
      return;
    }
    logger.warn(`${job} attempt ${attempt} failed, retrying: ${reason}`);
    channel.publish("", retryQueueNameFor(job), msg.content, {
      persistent: true,
      contentType: msg.properties.contentType,
      contentEncoding: msg.properties.contentEncoding,
      messageId: msg.properties.messageId,
      headers: { ...msg.properties.headers, [ATTEMPT_HEADER]: attempt + 1 },
    });
    channel.ack(msg);
  };
}
