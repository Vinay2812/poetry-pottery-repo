import {
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Role } from "@prisma/client";

import { UsersService } from "@/users/users.service";
import { ClerkService } from "@/common/clerk/clerk.service";
import { getRequest } from "@/common/graphql/execution-context";
import { AuthGuard } from "./auth.guard";

export const FORBIDDEN_MESSAGE = "Administrator access required";

@Injectable()
export class AdminGuard extends AuthGuard {
  constructor(clerk: ClerkService, users: UsersService) {
    super(clerk, users);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = await this.authenticate(getRequest(context));
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }
    return true;
  }
}
