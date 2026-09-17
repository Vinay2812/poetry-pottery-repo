import { describe, expect, it } from "vitest";

import {
  DEFAULT_TIME_ZONE,
  isTimeZone,
  safeTimeZone,
  supportedTimeZones,
} from "./timezones";

describe("isTimeZone", () => {
  it("accepts IANA identifiers", () => {
    expect(isTimeZone("Asia/Kolkata")).toBe(true);
    expect(isTimeZone("UTC")).toBe(true);
    expect(isTimeZone("Europe/London")).toBe(true);
  });

  it("rejects near misses and empty text", () => {
    expect(isTimeZone("Asia/Kolkatta")).toBe(false);
    expect(isTimeZone("Mars/Olympus")).toBe(false);
    expect(isTimeZone("")).toBe(false);
  });
});

describe("supportedTimeZones", () => {
  // ICU canonicalises Asia/Kolkata to Asia/Calcutta, so the default is prepended.
  it("lists the zones the browser knows, including the fallback", () => {
    const zones = supportedTimeZones();
    expect(zones.length).toBeGreaterThan(100);
    expect(zones).toContain(DEFAULT_TIME_ZONE);
    expect(zones.every(isTimeZone)).toBe(true);
  });
});

describe("safeTimeZone", () => {
  it("passes a real zone through", () => {
    expect(safeTimeZone("Europe/London")).toBe("Europe/London");
  });

  it("falls back when the stored zone no longer resolves", () => {
    expect(safeTimeZone("Asia/Kolkatta")).toBe(DEFAULT_TIME_ZONE);
    expect(safeTimeZone("")).toBe(DEFAULT_TIME_ZONE);
  });
});
