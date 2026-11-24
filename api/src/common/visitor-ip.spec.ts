import { describe, expect, it } from "vitest";

import {
  forwardedVisitorIp,
  VISITOR_IP_HEADER,
  VISITOR_KEY_HEADER,
} from "./visitor-ip";

const SECRET = "s".repeat(32);

function headers(key: string | undefined, ip: string | undefined) {
  return {
    ...(key === undefined ? {} : { [VISITOR_KEY_HEADER]: key }),
    ...(ip === undefined ? {} : { [VISITOR_IP_HEADER]: ip }),
  };
}

describe("forwardedVisitorIp", () => {
  it("trusts the named visitor when the key matches", () => {
    expect(forwardedVisitorIp(headers(SECRET, "203.0.113.7"), SECRET)).toBe(
      "203.0.113.7",
    );
    expect(forwardedVisitorIp(headers(SECRET, " 2001:db8::1 "), SECRET)).toBe(
      "2001:db8::1",
    );
  });

  it("ignores a wrong, shorter or missing key", () => {
    expect(
      forwardedVisitorIp(headers("x".repeat(32), "203.0.113.7"), SECRET),
    ).toBeNull();
    expect(forwardedVisitorIp(headers("s", "203.0.113.7"), SECRET)).toBeNull();
    expect(
      forwardedVisitorIp(headers(undefined, "203.0.113.7"), SECRET),
    ).toBeNull();
  });

  it("ignores everything while no secret is configured", () => {
    expect(
      forwardedVisitorIp(headers("", "203.0.113.7"), undefined),
    ).toBeNull();
    expect(
      forwardedVisitorIp(headers(SECRET, "203.0.113.7"), undefined),
    ).toBeNull();
  });

  it("refuses a value that is not a single address", () => {
    for (const ip of [
      "",
      "not-an-ip",
      "203.0.113.7, 10.0.0.1",
      "203.0.113.7:80",
    ]) {
      expect(forwardedVisitorIp(headers(SECRET, ip), SECRET)).toBeNull();
    }
    expect(forwardedVisitorIp(headers(SECRET, undefined), SECRET)).toBeNull();
  });
});
