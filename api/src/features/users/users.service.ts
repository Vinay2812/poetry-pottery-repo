import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { type User } from "@prisma/client";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import type { Logger } from "winston";

import { clampPage } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import type { UsersResponse } from "./users.type";

export interface ProvisionUserInput {
  auth_id: string;
  email: string;
  name: string | null;
  image: string | null;
  // True only for a verified primary Clerk address, the one case allowed to claim an existing row.
  can_adopt: boolean;
}

export const EMAIL_TAKEN_MESSAGE =
  "That email already belongs to an account. Verify it on this one to continue.";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async findPaginated(page: number, limit: number): Promise<UsersResponse> {
    const bounds = clampPage(page, limit);

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: bounds.skip,
        take: bounds.limit,
        orderBy: { created_at: "desc" },
      }),
      this.prisma.user.count(),
    ]);

    return { items, total, page: bounds.page, limit: bounds.limit };
  }

  findByAuth(authId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { auth_id: authId },
    });
  }

  // Email is unique, so an imported row carrying a production Clerk auth id has to be adopted
  // rather than inserted again when the same person signs in from another Clerk instance.
  // The role is never written here: the database owns it.
  async provisionUser(input: ProvisionUserInput): Promise<User> {
    // A first sign-in fires several queries at once. The lock holds everyone but the first
    // behind the insert, so the rest read the row back instead of racing it into P2002.
    return this.prisma.withTransaction(async () => {
      await this.prisma
        .$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.auth_id}))`;

      const byAuth = await this.prisma.user.findUnique({
        where: { auth_id: input.auth_id },
      });
      if (byAuth) {
        return this.prisma.user.update({
          where: { id: byAuth.id },
          data: { email: input.email, name: input.name, image: input.image },
        });
      }

      const byEmail = await this.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (byEmail) {
        if (!input.can_adopt) {
          this.logger.warn("refused to adopt a user row by unverified email", {
            auth_id: input.auth_id,
            user_id: byEmail.id,
          });
          throw new UnauthorizedException(EMAIL_TAKEN_MESSAGE);
        }
        this.logger.info("adopted a user row by verified email", {
          auth_id: input.auth_id,
          previous_auth_id: byEmail.auth_id,
          user_id: byEmail.id,
        });
        return this.prisma.user.update({
          where: { id: byEmail.id },
          data: {
            auth_id: input.auth_id,
            name: input.name,
            image: input.image,
          },
        });
      }

      return this.prisma.user.create({
        data: {
          auth_id: input.auth_id,
          email: input.email,
          name: input.name,
          image: input.image,
        },
      });
    });
  }
}
