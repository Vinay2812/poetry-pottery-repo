import type { User } from "@prisma/client";
import type { Request, Response } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
      currentUser?: User;
    }
  }
}

export type AppRequest = Request;
export type AppResponse = Response;

export interface GqlContext {
  req: AppRequest;
  res: AppResponse;
}
