import { type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";

import { readAuthId } from "@/common/clerk/clerk.util";
import { getRequestResponse } from "@/common/graphql/execution-context";
import type { AppRequest, AppResponse } from "@/common/types/express";

export const STRICT_THROTTLER = "strict";
export const STRICT_THROTTLE_KEY = "strict-throttle";

const reflector = new Reflector();

// The strict profile is opt-in, otherwise its low limit would apply to every route.
export function isStrictThrottled(context: ExecutionContext): boolean {
  return (
    reflector.getAllAndOverride<boolean>(STRICT_THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) === true
  );
}

export function resolveClientIp(request: AppRequest): string {
  const forwarded = request.headers["x-forwarded-for"];
  const header = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = header?.split(",")[0]?.trim();
  if (first !== undefined && first.length > 0) {
    return first;
  }
  return request.ip ?? request.socket.remoteAddress ?? "unknown";
}

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  // Mandatory: the base implementation only understands http contexts.
  protected override getRequestResponse(context: ExecutionContext): {
    req: AppRequest;
    res: AppResponse;
  } {
    return getRequestResponse(context);
  }

  protected override getTracker(request: AppRequest): Promise<string> {
    const authId = readAuthId(request);
    return Promise.resolve(
      authId !== null ? `user:${authId}` : `ip:${resolveClientIp(request)}`,
    );
  }
}
