import { RABBIT_HANDLER } from "@golevelup/nestjs-rabbitmq";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { MailConsumer } from "./mail.consumer";
import { MailService, type MailMessage } from "./mail.service";

const subscriptionSchema = z.object({
  type: z.string(),
  exchange: z.string(),
  routingKey: z.string(),
  queue: z.string(),
  queueOptions: z.object({
    durable: z.boolean(),
    deadLetterExchange: z.string(),
  }),
});

function subscriptionOn(
  target: object,
  method: string,
): z.infer<typeof subscriptionSchema> {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    target,
    method,
  )?.value;
  if (typeof handler !== "function") {
    throw new Error(`${method} is not a handler`);
  }
  return subscriptionSchema.parse(Reflect.getMetadata(RABBIT_HANDLER, handler));
}

function message(overrides: Partial<MailMessage> = {}): MailMessage {
  return {
    to: "potter@example.com",
    subject: "Order kiln-7 received",
    html: "<p>Thanks for ordering</p>",
    text: "Thanks for ordering",
    ...overrides,
  };
}

const mailMock = {
  enqueue: vi.fn<MailService["enqueue"]>(),
  deliver: vi.fn<MailService["deliver"]>(),
};

describe("MailConsumer", () => {
  let consumer: MailConsumer;

  beforeEach(async () => {
    vi.clearAllMocks();
    mailMock.deliver.mockResolvedValue(undefined);
    const moduleRef = await Test.createTestingModule({
      providers: [MailConsumer, { provide: MailService, useValue: mailMock }],
    }).compile();
    consumer = moduleRef.get(MailConsumer);
  });

  it("hands a well-formed job to the mailer as it arrived", async () => {
    const payload = message();

    await consumer.handle(payload);

    expect(mailMock.deliver).toHaveBeenCalledWith(payload);
  });

  it("accepts a job with no text part, since the schema makes it optional", async () => {
    const payload = {
      to: "potter@example.com",
      subject: "Seat request",
      html: "<p>Held</p>",
    };

    await consumer.handle(payload);

    expect(mailMock.deliver).toHaveBeenCalledWith(payload);
  });

  it("drops unknown extras rather than passing them to the mailer", async () => {
    await consumer.handle({ ...message(), bcc: "someone@else.test" });

    expect(mailMock.deliver).toHaveBeenCalledWith(message());
  });

  it("refuses a job with a missing field and never reaches the mailer", async () => {
    await expect(
      consumer.handle({ to: "potter@example.com", subject: "No body" }),
    ).rejects.toThrow();
    expect(mailMock.deliver).not.toHaveBeenCalled();
  });

  it("refuses a job whose text part is a number", async () => {
    await expect(consumer.handle({ ...message(), text: 42 })).rejects.toThrow();
    expect(mailMock.deliver).not.toHaveBeenCalled();
  });

  it("refuses an empty recipient so nothing is mailed into the void", async () => {
    await expect(consumer.handle(message({ to: "" }))).rejects.toThrow();
    expect(mailMock.deliver).not.toHaveBeenCalled();
  });

  it("refuses a payload that is not an object at all", async () => {
    await expect(consumer.handle(null)).rejects.toThrow();
    await expect(consumer.handle("mail.send")).rejects.toThrow();
    await expect(consumer.handle(undefined)).rejects.toThrow();
    expect(mailMock.deliver).not.toHaveBeenCalled();
  });

  it("lets a delivery failure escape so the broker can dead-letter the job", async () => {
    mailMock.deliver.mockRejectedValue(new Error("smtp refused"));

    await expect(consumer.handle(message())).rejects.toThrow("smtp refused");
  });

  it("listens on the durable mail queue bound to the topic exchange", () => {
    expect(subscriptionOn(MailConsumer.prototype, "handle")).toEqual({
      type: "subscribe",
      exchange: "poetry",
      routingKey: "mail.send",
      queue: "poetry.mail.send",
      queueOptions: { durable: true, deadLetterExchange: "poetry.dlx" },
    });
  });
});
