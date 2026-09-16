import { describe, expect, it } from "vitest";

import {
  DEAD_LETTER_EXCHANGE,
  DEAD_LETTER_QUEUE,
  type JobName,
  jobSchemas,
  QUEUE_EXCHANGE,
  queueNameFor,
} from "./jobs";

describe("search indexing job payloads", () => {
  it("accepts an integer id", () => {
    expect(jobSchemas["search.index-product"].parse({ productId: 12 })).toEqual(
      { productId: 12 },
    );
    expect(jobSchemas["search.index-event"].parse({ eventId: 3 })).toEqual({
      eventId: 3,
    });
  });

  it("rejects a float, a string, a missing field and a non-object", () => {
    expect(() =>
      jobSchemas["search.index-product"].parse({ productId: 1.5 }),
    ).toThrow();
    expect(() =>
      jobSchemas["search.index-product"].parse({ productId: "12" }),
    ).toThrow();
    expect(() => jobSchemas["search.index-product"].parse({})).toThrow();
    expect(() => jobSchemas["search.index-product"].parse(null)).toThrow();
    expect(() =>
      jobSchemas["search.index-event"].parse({ productId: 12 }),
    ).toThrow();
  });
});

describe("mail send job payload", () => {
  const message = {
    to: "potter@example.com",
    subject: "Order received",
    html: "<p>Thanks</p>",
  };

  it("accepts a message with and without a text part", () => {
    expect(jobSchemas["mail.send"].parse(message)).toEqual(message);
    expect(
      jobSchemas["mail.send"].parse({ ...message, text: "Thanks" }),
    ).toEqual({ ...message, text: "Thanks" });
  });

  it("rejects an empty recipient, subject or body", () => {
    expect(() =>
      jobSchemas["mail.send"].parse({ ...message, to: "" }),
    ).toThrow();
    expect(() =>
      jobSchemas["mail.send"].parse({ ...message, subject: "" }),
    ).toThrow();
    expect(() =>
      jobSchemas["mail.send"].parse({ ...message, html: "" }),
    ).toThrow();
  });

  it("rejects a missing field, a wrong type and a non-object", () => {
    expect(() =>
      jobSchemas["mail.send"].parse({
        to: message.to,
        subject: message.subject,
      }),
    ).toThrow();
    expect(() =>
      jobSchemas["mail.send"].parse({ ...message, text: 42 }),
    ).toThrow();
    expect(() => jobSchemas["mail.send"].parse("mail.send")).toThrow();
  });
});

describe("queue topology", () => {
  const jobNames: JobName[] = [
    "search.index-product",
    "search.index-event",
    "mail.send",
  ];

  it("names one durable queue per job under the topic exchange", () => {
    expect(Object.keys(jobSchemas)).toEqual(jobNames);
    expect(jobNames.map(queueNameFor)).toEqual([
      "poetry.search.index-product",
      "poetry.search.index-event",
      "poetry.mail.send",
    ]);
  });

  it("keeps the exchange and dead-letter names the module binds", () => {
    expect(QUEUE_EXCHANGE).toBe("poetry");
    expect(DEAD_LETTER_EXCHANGE).toBe("poetry.dlx");
    expect(DEAD_LETTER_QUEUE).toBe("poetry.dead-letters");
  });
});
