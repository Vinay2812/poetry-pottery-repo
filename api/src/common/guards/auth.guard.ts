import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { getAuth } from "@clerk/express";

import { UsersService } from "@/features/users/users.service";
import { ClerkService } from "@/common/clerk/clerk.service";
import { getRequest } from "@/common/graphql/execution-context";
import type { AppRequest } from "@/common/types/express";
import type { AuthUser } from "../clerk/clerk.type";
import { PrismaService } from "@/prisma/prisma.service";
import type { UserRole } from "@prisma/client";

export const UNAUTHENTICATED_MESSAGE = "Authentication required";
export const NO_PRIMARY_EMAIL_MESSAGE = "No primary email found";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  // Users whose missing name was already looked up in this process, so Clerk is asked once.
  private readonly profileLookups = new Set<number>();

  constructor(
    private readonly clerk: ClerkService,
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.authenticate(getRequest(context));
    return true;
  }

  // For public resolvers that personalise when a session happens to exist.
  async tryAuthenticate(request: AppRequest): Promise<AuthUser | null> {
    try {
      return await this.authenticate(request);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return null;
      }
      throw error;
    }
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

    // A claim is only a hint; the row that owns this auth id decides who the caller is.
    const owner = await this.users.findByAuth(authId);
    if (owner) {
      if (dbUserId !== owner.id || role !== owner.role) {
        this.refreshClaims(authId, owner.id, owner.role);
      }
      // A missing name is what reviews and the dashboard show as "A customer"; a photo rides along.
      if (owner.name === null && !this.profileLookups.has(owner.id)) {
        this.profileLookups.add(owner.id);
        this.fillProfile(authId, owner.id);
      }
      const authUser: AuthUser = {
        db_user_id: owner.id,
        role: owner.role,
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

    // The database owns the role; claims only cache it, so provisioning never writes a role.
    const user = await this.prisma.withTransaction(() =>
      this.users.provisionUser({
        auth_id: authId,
        email: primaryEmail,
        name,
        image,
        can_adopt: this.clerk.hasVerifiedPrimaryEmail(clerkUser),
      }),
    );
    this.refreshClaims(authId, user.id, user.role);

    const authUser: AuthUser = {
      db_user_id: user.id,
      role: user.role,
      auth_id: authId,
    };
    request.authenticatedUser = authUser;
    return authUser;
  }

  // A name set in Clerk after the first sign-in reaches reviews and the dashboard without a webhook.
  private fillProfile(authId: string, userId: number): void {
    // Started from a resolved promise so even a synchronous failure lands in the catch below.
    Promise.resolve()
      .then(() => this.clerk.getUser(authId))
      .then((clerkUser) =>
        this.users.fillMissingProfile(userId, {
          name: this.clerk.getFullName(clerkUser) ?? null,
          image: this.clerk.getImageUrl(clerkUser) ?? null,
        }),
      )
      .catch((error: unknown) => {
        this.profileLookups.delete(userId);
        this.logger.warn(
          `Could not fill the profile for user ${userId}: ${String(error)}`,
        );
      });
  }

  // The metadata only caches the row for the UI, so a Clerk outage must never fail or roll back a sign-in.
  private refreshClaims(
    authId: string,
    dbUserId: number,
    role: UserRole,
  ): void {
    this.clerk
      .updatePublicMetadata(authId, { dbUserId, role })
      .catch((error: unknown) => {
        this.logger.warn(
          `Could not refresh Clerk metadata for ${authId}: ${String(error)}`,
        );
      });
  }
}
