import {
  createParamDecorator,
  type ExecutionContext,
  InternalServerErrorException,
} from "@nestjs/common";

import { getRequest } from "@/common/graphql/execution-context";
import type { AuthUser } from "../clerk/clerk.type";

export const CurrentUser = createParamDecorator(
  (_data: undefined, context: ExecutionContext): AuthUser => {
    const user = getRequest(context).authenticatedUser;
    if (!user) {
      // Only reachable when the resolver forgot @AuthRequired()/@AdminRequired().
      throw new InternalServerErrorException(
        "CurrentUser requires an auth guard on the resolver",
      );
    }
    return user;
  },
);
