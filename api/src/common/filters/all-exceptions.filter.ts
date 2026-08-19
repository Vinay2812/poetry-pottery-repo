import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
} from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";
import { z } from "zod";

import { findRequest, isGraphQlHost } from "@/common/graphql/execution-context";
import type { AppResponse } from "@/common/types/express";

const GENERIC_MESSAGE = "Internal server error";
const SERVER_ERROR_FLOOR: number = HttpStatus.INTERNAL_SERVER_ERROR;

const httpPayloadSchema = z.union([
  z.string(),
  z.object({ message: z.union([z.string(), z.array(z.string())]) }),
]);

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): HttpException | void {
    const request = findRequest(host);
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const clientMessage = this.toClientMessage(exception);
    const meta = {
      requestId: request?.requestId,
      path: request?.originalUrl,
      status,
    };

    if (status >= SERVER_ERROR_FLOOR) {
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        {
          ...meta,
          stack: exception instanceof Error ? exception.stack : undefined,
        },
      );
      Sentry.captureException(exception);
    } else {
      this.logger.warn(clientMessage, meta);
    }

    if (isGraphQlHost(host)) {
      return exception instanceof HttpException
        ? exception
        : new InternalServerErrorException(GENERIC_MESSAGE);
    }

    host.switchToHttp().getResponse<AppResponse>().status(status).json({
      statusCode: status,
      message: clientMessage,
      requestId: request?.requestId,
      timestamp: new Date().toISOString(),
    });
  }

  private toClientMessage(exception: unknown): string {
    if (!(exception instanceof HttpException)) {
      return GENERIC_MESSAGE;
    }
    const parsed = httpPayloadSchema.safeParse(exception.getResponse());
    if (!parsed.success) {
      return exception.message;
    }
    if (typeof parsed.data === "string") {
      return parsed.data;
    }
    const { message } = parsed.data;
    return Array.isArray(message) ? message.join(", ") : message;
  }
}
