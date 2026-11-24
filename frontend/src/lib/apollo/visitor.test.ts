import { describe, expect, it } from "vitest";

import { visitorHeaders, visitorIp } from "./visitor";

const SECRET = "s".repeat(32);

describe("visitorIp", () => {
  it("prefers the address the edge stamped", () => {
    const incoming = new Headers({
      "x-real-ip": "203.0.113.7",
      "x-forwarded-for": "198.51.100.1, 10.0.0.1",
    });
    expect(visitorIp(incoming)).toBe("203.0.113.7");
  });

  it("falls back to the first forwarded address", () => {
    const incoming = new Headers({
      "x-forwarded-for": " 198.51.100.1 , 10.0.0.1",
    });
    expect(visitorIp(incoming)).toBe("198.51.100.1");
  });

  it("returns null when the request names no one", () => {
    expect(visitorIp(new Headers())).toBeNull();
    expect(visitorIp(new Headers({ "x-forwarded-for": " , " }))).toBeNull();
  });
});

describe("visitorHeaders", () => {
  it("sends the visitor and the key together", () => {
    const incoming = new Headers({ "x-real-ip": "203.0.113.7" });
    expect(visitorHeaders(incoming, SECRET)).toEqual({
      "x-visitor-ip": "203.0.113.7",
      "x-visitor-key": SECRET,
    });
  });

  it("sends nothing without a secret or an address", () => {
    expect(
      visitorHeaders(new Headers({ "x-real-ip": "203.0.113.7" }), undefined),
    ).toEqual({});
    expect(visitorHeaders(new Headers(), SECRET)).toEqual({});
  });
});
