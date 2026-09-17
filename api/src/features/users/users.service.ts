import { Injectable } from "@nestjs/common";
import { type User } from "@prisma/client";

import { clampPage } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import type { UsersResponse } from "./users.type";

export interface ProvisionUserInput {
  auth_id: string;
  email: string;
  name: string | null;
  image: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
