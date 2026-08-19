import type { Request, Response } from "express";
import { AuthUser } from "../clerk/clerk.type";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
      authenticatedUser?: AuthUser;
    }
  }
}

export type AppRequest = Request;
export type AppResponse = Response;

export interface GqlContext {
  req: AppRequest;
  res: AppResponse;
}
