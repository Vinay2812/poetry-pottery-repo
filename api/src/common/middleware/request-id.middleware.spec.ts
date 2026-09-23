import { EventEmitter } from "node:events";

import type { Logger } from "winston";
import { describe, expect, it, vi } from "vitest";

import type { AppRequest, AppResponse } from "@/common/types/express";
import {
  REQUEST_ID_HEADER,
  RequestIdMiddleware,
  toAccessLevel,
} from "./request-id.middleware";

function run(header?: string, status = 200, originalUrl = "/graphql?x=1") {
  const log = vi.fn();
  const middleware = new RequestIdMiddleware({ log } as unknown as Logger);
  const req = {
    headers: header === undefined ? {} : { [REQUEST_ID_HEADER]: header },
    method: "POST",
    path: "/",
    originalUrl,
  } as unknown as AppRequest;
  const res = Object.assign(new EventEmitter(), {
    setHeader: vi.fn(),
    statusCode: status,
  }) as unknown as AppResponse;
  middleware.use(req, res, vi.fn());
  req.graphqlOperation = "query Products";
  res.emit("finish");
  return { req, log };
}

describe("RequestIdMiddleware", () => {
  it("keeps a well-formed id from the caller", () => {
    expect(run("trace-abc_123.4").req.requestId).toBe("trace-abc_123.4");
  });

  it("replaces a missing, oversized or malformed id with a fresh one", () => {
    for (const header of [undefined, "x".repeat(65), "bad id\nforged line"]) {
      const id = run(header).req.requestId;
      expect(id).not.toBe(header);
      expect(id).toMatch(/^[0-9a-f-]{36}$/);
    }
  });

  it("writes one access line when the response finishes, naming the operation", () => {
    const { log } = run("trace-1", 200);
    expect(log).toHaveBeenCalledWith(
      "info",
      expect.stringMatching(/^POST \/graphql 200 \d+ms$/),
      expect.objectContaining({ requestId: "trace-1", op: "query Products" }),
    );
  });
});

describe("toAccessLevel", () => {
  it("raises failures and quietens probes and preflights", () => {
    expect(toAccessLevel("POST", "/graphql", 503)).toBe("error");
    expect(toAccessLevel("POST", "/graphql", 429)).toBe("warn");
    expect(toAccessLevel("GET", "/health", 200)).toBe("debug");
    expect(toAccessLevel("OPTIONS", "/graphql", 204)).toBe("debug");
    expect(toAccessLevel("POST", "/graphql", 200)).toBe("info");
  });
});
