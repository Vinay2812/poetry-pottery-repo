import { randomUUID } from "node:crypto";

import { Inject, Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";

import type { AppRequest, AppResponse } from "@/common/types/express";

export const REQUEST_ID_HEADER = "x-request-id";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(req: AppRequest, res: AppResponse, next: NextFunction): void {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const requestId =
      (Array.isArray(incoming) ? incoming[0] : incoming) ?? randomUUID();

    req.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    this.logger.info(`${req.method} ${req.originalUrl}`, { requestId });
    next();
  }
}
