import { type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ThrottlerException, ThrottlerGuard } from "@nestjs/throttler";

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

// request.ip honours express "trust proxy", so forwarded headers only count from trusted hops.
export function resolveClientIp(request: AppRequest): string {
  return request.ip ?? request.socket?.remoteAddress ?? "unknown";
}

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  // Queue consumers also pass through global guards; only web traffic is rate limited,
  // and a storage outage must not take the API down.
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType<string>();
    if (type !== "http" && type !== "graphql") {
      return true;
    }
    try {
      return await super.canActivate(context);
    } catch (error) {
      if (error instanceof ThrottlerException) {
        throw error;
      }
      return true;
    }
  }

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
