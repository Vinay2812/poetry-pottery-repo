import type { Request, Response } from "express";
import { AuthUser } from "../clerk/clerk.type";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
      authenticatedUser?: AuthUser;
      // Set by the GraphQL logging plugin so the access log can name the operation.
      graphqlOperation?: string;
      // Per-request memo so list resolvers look wishlist membership up once.
      wishlistIds?: Promise<Set<number>>;
    }
  }
}

export type AppRequest = Request;
export type AppResponse = Response;

export interface GqlContext {
  req: AppRequest;
  res: AppResponse;
}
