import { clerkMiddleware, getAuth } from "@clerk/express";
import type { NextFunction, RequestHandler } from "express";

import { env } from "@/config/env";
import type { AppRequest, AppResponse } from "@/common/types/express";

// getAuth throws when clerkMiddleware has not run; treat that as unauthenticated.
export function readAuthId(request: AppRequest): string | null {
  try {
    return getAuth(request).userId ?? null;
  } catch {
    return null;
  }
}

function isSandboxRequest(request: AppRequest): boolean {
  return request.method === "GET" && request.path === "/graphql";
}

// Clerk's dev-instance handshake redirects document requests, which would bounce the
// Apollo Sandbox away from /graphql, so it is bypassed for that one route outside production.
export function clerkAuthMiddleware(): RequestHandler {
  const middleware = clerkMiddleware();
  return (req: AppRequest, res: AppResponse, next: NextFunction) => {
    if (!env.isProduction && isSandboxRequest(req)) {
      next();
      return;
    }
    middleware(req, res, next);
  };
}
