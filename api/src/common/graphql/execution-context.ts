import type { ArgumentsHost, ExecutionContext } from "@nestjs/common";
import {
  GqlArgumentsHost,
  GqlExecutionContext,
  type GqlContextType,
} from "@nestjs/graphql";

import type {
  AppRequest,
  AppResponse,
  GqlContext,
} from "@/common/types/express";

export function isGraphQlHost(host: ArgumentsHost): boolean {
  return host.getType<GqlContextType>() === "graphql";
}

export function getRequestResponse(context: ExecutionContext): GqlContext {
  if (isGraphQlHost(context)) {
    return GqlExecutionContext.create(context).getContext<GqlContext>();
  }
  const http = context.switchToHttp();
  return {
    req: http.getRequest<AppRequest>(),
    res: http.getResponse<AppResponse>(),
  };
}

export function getRequest(context: ExecutionContext): AppRequest {
  return getRequestResponse(context).req;
}

// Exception filters only receive an ArgumentsHost, and the request may be absent for
// non-http transports, so this variant is allowed to fail softly.
export function findRequest(host: ArgumentsHost): AppRequest | null {
  if (isGraphQlHost(host)) {
    return (
      GqlArgumentsHost.create(host).getContext<Partial<GqlContext>>().req ??
      null
    );
  }
  return host.switchToHttp().getRequest<AppRequest | undefined>() ?? null;
}
