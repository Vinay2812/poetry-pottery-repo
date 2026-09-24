import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { ATTEMPT_HEADER, RETRY } from "./jobs";
import {
  attemptOf,
  type RetryMessage,
  retryOrDeadLetter,
  shouldRetry,
} from "./retry";

const channel = { ack: vi.fn(), nack: vi.fn(), publish: vi.fn() };

function message(headers: Record<string, unknown> = {}): RetryMessage {
  return {
    content: Buffer.from(JSON.stringify({ productId: 4 })),
    properties: { headers, contentType: "application/json" },
  };
}

describe("attemptOf", () => {
  it("counts a fresh message as the first attempt", () => {
    expect(attemptOf(undefined)).toBe(1);
    expect(attemptOf({})).toBe(1);
    expect(attemptOf({ [ATTEMPT_HEADER]: "3" })).toBe(1);
  });

  it("reads the attempt the retry loop stamped", () => {
    expect(attemptOf({ [ATTEMPT_HEADER]: 3 })).toBe(3);
  });
});

describe("shouldRetry", () => {
  it("retries transient failures until the budget is spent", () => {
    expect(shouldRetry(1, new Error("smtp blip"))).toBe(true);
    expect(shouldRetry(RETRY.maxAttempts - 1, new Error("smtp blip"))).toBe(
      true,
    );
    expect(shouldRetry(RETRY.maxAttempts, new Error("smtp blip"))).toBe(false);
  });

  it("never retries a payload the consumer could not parse", () => {
    expect(shouldRetry(1, new ZodError([]))).toBe(false);
  });
});

describe("retryOrDeadLetter", () => {
  const handle = retryOrDeadLetter("notify.back-in-stock");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parks a failed message on the job's delay queue with the next attempt stamped", () => {
    const msg = message();

    handle(channel, msg, new Error("db away"));

    expect(channel.publish).toHaveBeenCalledWith(
      "",
      "poetry.notify.back-in-stock.retry",
      msg.content,
      expect.objectContaining({
        persistent: true,
        contentType: "application/json",
        headers: { [ATTEMPT_HEADER]: 2 },
      }),
    );
    expect(channel.ack).toHaveBeenCalledWith(msg);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it("dead-letters once the attempts run out", () => {
    const msg = message({ [ATTEMPT_HEADER]: RETRY.maxAttempts });

    handle(channel, msg, new Error("still down"));

    expect(channel.nack).toHaveBeenCalledWith(msg, false, false);
    expect(channel.publish).not.toHaveBeenCalled();
    expect(channel.ack).not.toHaveBeenCalled();
  });

  it("dead-letters a malformed payload straight away", () => {
    const msg = message();

    handle(channel, msg, new ZodError([]));

    expect(channel.nack).toHaveBeenCalledWith(msg, false, false);
    expect(channel.publish).not.toHaveBeenCalled();
  });
});
