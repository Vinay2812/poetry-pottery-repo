import { describe, expect, it } from "vitest";

import { redact, redactMeta, toDevLine } from "./log-format";

describe("redact", () => {
  it("hides customer details and secrets at any depth", () => {
    expect(
      redact({
        input: {
          email: "maya@example.test",
          address: { line1: "12 Kiln Road", pincode: "416416" },
          seats: 2,
        },
        headers: { Authorization: "Bearer abc" },
      }),
    ).toEqual({
      input: { email: "[redacted]", address: "[redacted]", seats: 2 },
      headers: { Authorization: "[redacted]" },
    });
  });

  it("cuts long strings and stops at a sane depth", () => {
    const long = "x".repeat(250);
    expect(redact(long)).toBe(`${"x".repeat(200)}…(250)`);
    const deep = { a: { b: { c: { d: { e: { f: { g: { h: 1 } } } } } } } };
    expect(JSON.stringify(redact(deep))).toContain("[deep]");
  });
});

describe("redactMeta", () => {
  it("redacts attached fields but never the log line itself", () => {
    const info = redactMeta().transform({
      level: "info",
      message: "contact form sent",
      variables: { input: { message: "call me on 98765" } },
    });
    expect(info).toMatchObject({
      message: "contact form sent",
      variables: { input: { message: "[redacted]" } },
    });
  });
});

describe("toDevLine", () => {
  it("prints one line with the context, a short request id and key=value pairs", () => {
    expect(
      toDevLine({
        level: "info",
        message: "POST /graphql 200 56ms",
        timestamp: "23:02:32.123",
        context: "Http",
        service: "api",
        requestId: "121fa094-a2d4-4df7-b2d3-cd0000000000",
        op: "query Products",
        userId: 7,
        durationMs: 56,
      }),
    ).toBe(
      "23:02:32.123 INFO  [Http] POST /graphql 200 56ms  req=121fa094 op=query Products userId=7",
    );
  });

  it("puts the stack under an error line", () => {
    const line = toDevLine({
      level: "error",
      message: "boom",
      timestamp: "23:02:32.123",
      stack: "Error: boom\n    at x",
    });
    expect(line).toBe("23:02:32.123 ERROR boom\nError: boom\n    at x");
  });
});
