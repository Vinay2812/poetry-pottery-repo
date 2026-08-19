import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { User } from "@prisma/client";

import { UsersService } from "@/users/users.service";
import { ClerkService } from "@/common/clerk/clerk.service";
import { getRequest } from "@/common/graphql/execution-context";
import type { AppRequest } from "@/common/types/express";

export const UNAUTHENTICATED_MESSAGE = "Authentication required";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly clerk: ClerkService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.authenticate(getRequest(context));
    return true;
  }

  protected async authenticate(request: AppRequest): Promise<User> {
    const cached = request.currentUser;
    if (cached) {
      return cached;
    }

    const authId = this.clerk.getAuthId(request);
    if (!authId) {
      throw new UnauthorizedException(UNAUTHENTICATED_MESSAGE);
    }

    const user = await this.users.provisionFromAuth({
      provider: this.clerk.provider,
      authId,
      loadProfile: () => this.clerk.fetchProfile(authId),
    });
    request.currentUser = user;
    return user;
  }
}
