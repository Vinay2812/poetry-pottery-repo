import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { getAuth } from "@clerk/express";

import { UsersService } from "@/users/users.service";
import { ClerkService } from "@/common/clerk/clerk.service";
import { getRequest } from "@/common/graphql/execution-context";
import type { AppRequest } from "@/common/types/express";
import type { AuthUser } from "../clerk/clerk.type";
import { PrismaService } from "@/prisma/prisma.service";

export const UNAUTHENTICATED_MESSAGE = "Authentication required";
export const NO_PRIMARY_EMAIL_MESSAGE = "No primary email found";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly clerk: ClerkService,
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.authenticate(getRequest(context));
    return true;
  }

  protected async authenticate(request: AppRequest): Promise<AuthUser> {
    const cached = request.authenticatedUser;
    if (cached) {
      return cached;
    }

    const auth = getAuth(request);
    if (!auth.isAuthenticated) {
      throw new UnauthorizedException(UNAUTHENTICATED_MESSAGE);
    }

    const authId = auth.userId;
    const { dbUserId, role } = auth.sessionClaims;

    if (dbUserId && role) {
      const authUser: AuthUser = {
        db_user_id: dbUserId,
        role,
        auth_id: authId,
      };
      request.authenticatedUser = authUser;
      return authUser;
    }

    const clerkUser = await this.clerk.getUser(authId);
    const primaryEmail = this.clerk.getPrimaryEmail(clerkUser);
    if (!primaryEmail) {
      throw new UnauthorizedException(NO_PRIMARY_EMAIL_MESSAGE);
    }

    const name = this.clerk.getFullName(clerkUser) ?? null;
    const image = this.clerk.getImageUrl(clerkUser) ?? null;

    const authUser = await this.prisma.withTransaction(async () => {
      // The database owns the role; claims only cache it, so the upsert never writes a role.
      const user = await this.users.upsertUser({
        where: { auth_id: authId },
        create: { auth_id: authId, email: primaryEmail, name, image },
        update: { email: primaryEmail, name, image },
      });

      await this.clerk.updatePublicMetadata(authId, {
        dbUserId: user.id,
        role: user.role,
      });

      return {
        db_user_id: user.id,
        role: user.role,
        auth_id: authId,
      };
    });

    request.authenticatedUser = authUser;
    return authUser;
  }
}
