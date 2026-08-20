import {
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { UserRole } from "@prisma/client";

import { UsersService } from "@/features/users/users.service";
import { ClerkService } from "@/common/clerk/clerk.service";
import { getRequest } from "@/common/graphql/execution-context";
import { AuthGuard } from "./auth.guard";
import { PrismaService } from "@/prisma/prisma.service";

export const FORBIDDEN_MESSAGE = "Administrator access required";

@Injectable()
export class AdminGuard extends AuthGuard {
  constructor(clerk: ClerkService, users: UsersService, prisma: PrismaService) {
    super(clerk, users, prisma);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = await this.authenticate(getRequest(context));
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(FORBIDDEN_MESSAGE);
    }
    return true;
  }
}
