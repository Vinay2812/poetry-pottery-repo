import { randomUUID } from "node:crypto";

import { Inject, Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";

import type { AppRequest, AppResponse } from "@/common/types/express";

export const REQUEST_ID_HEADER = "x-request-id";

// A caller's id is kept for tracing only when it looks like one, so it cannot bloat or forge log lines.
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

// Probes and CORS preflights would drown out real traffic at info.
const QUIET_PATHS = new Set(["/health"]);

export function toAccessLevel(
  method: string,
  path: string,
  status: number,
): "error" | "warn" | "info" | "debug" {
  if (status >= 500) return "error";
  if (status >= 400) return "warn";
  if (method === "OPTIONS" || QUIET_PATHS.has(path)) return "debug";
  return "info";
}

// Tags every request with an id and writes one access line when the response finishes.
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(req: AppRequest, res: AppResponse, next: NextFunction): void {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const candidate = Array.isArray(incoming) ? incoming[0] : incoming;
    const requestId =
      candidate && REQUEST_ID_PATTERN.test(candidate)
        ? candidate
        : randomUUID();

    req.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    // Nest mounts middleware on a wildcard, so req.path is relative; the query string may carry tokens.
    const path = req.originalUrl.split("?")[0] ?? req.originalUrl;
    const startedAt = process.hrtime.bigint();
    res.on("finish", () => {
      const durationMs = Number(
        (process.hrtime.bigint() - startedAt) / 1_000_000n,
      );
      this.logger.log(
        toAccessLevel(req.method, path, res.statusCode),
        `${req.method} ${path} ${res.statusCode} ${durationMs}ms`,
        {
          requestId,
          op: req.graphqlOperation,
          userId: req.authenticatedUser?.db_user_id,
          durationMs,
        },
      );
    });
    next();
  }
}
