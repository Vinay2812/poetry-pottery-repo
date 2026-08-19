import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import type { User } from "@prisma/client";

import { getRequest } from "@/common/graphql/execution-context";
import { UNAUTHENTICATED_MESSAGE } from "@/common/guards/auth.guard";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const user = getRequest(context).currentUser;
    if (!user) {
      throw new UnauthorizedException(UNAUTHENTICATED_MESSAGE);
    }
    return user;
  },
);
