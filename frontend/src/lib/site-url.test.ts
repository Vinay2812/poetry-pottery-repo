import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestHeaders } = vi.hoisted(() => ({
  requestHeaders: new Headers(),
}));

vi.mock("next/headers", () => ({
  headers: async () => requestHeaders,
}));

import { toAbsoluteUrl } from "./site-url";

function givenHeaders(entries: Record<string, string>) {
  for (const key of [...requestHeaders.keys()]) requestHeaders.delete(key);
  for (const [key, value] of Object.entries(entries)) {
    requestHeaders.set(key, value);
  }
}

beforeEach(() => {
  givenHeaders({});
});

describe("toAbsoluteUrl", () => {
  it("builds the URL from the proxy headers when there is one in front", async () => {
    givenHeaders({
      "x-forwarded-host": "poetryandpottery.in",
      "x-forwarded-proto": "https",
      host: "0.0.0.0:3030",
    });
    expect(await toAbsoluteUrl("/products/drip-sip-mug")).toBe(
      "https://poetryandpottery.in/products/drip-sip-mug",
    );
  });

  it("falls back to the request host and assumes https off localhost", async () => {
    givenHeaders({ host: "poetryandpottery.in" });
    expect(await toAbsoluteUrl("/custom")).toBe(
      "https://poetryandpottery.in/custom",
    );
  });

  it("stays on http while the studio is running locally", async () => {
    givenHeaders({ host: "localhost:3030" });
    expect(await toAbsoluteUrl("/custom")).toBe("http://localhost:3030/custom");
  });

  it("assumes the dev server when no host comes through at all", async () => {
    expect(await toAbsoluteUrl("/")).toBe("http://localhost:3030/");
  });

  it("trusts the forwarded protocol even on localhost", async () => {
    givenHeaders({ host: "localhost:3030", "x-forwarded-proto": "https" });
    expect(await toAbsoluteUrl("/cart")).toBe("https://localhost:3030/cart");
  });
});
