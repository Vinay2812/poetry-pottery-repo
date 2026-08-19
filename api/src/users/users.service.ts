import { Injectable } from "@nestjs/common";
import { UserRole, type User } from "@prisma/client";

import type { AuthProvisionRequest } from "@/common/auth/auth-profile";
import { PrismaService } from "@/prisma/prisma.service";
import type { UsersResponse } from "./users.type";

export const MAX_PAGE_SIZE = 100;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPaginated(page: number, limit: number): Promise<UsersResponse> {
    const safePage = Math.max(1, Math.trunc(page));
    const safeLimit = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(limit)));

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { created_at: "desc" },
      }),
      this.prisma.user.count(),
    ]);

    return { items, total, page: safePage, limit: safeLimit };
  }

  findByAuth(authId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { auth_id: authId },
    });
  }

  // Just-in-time provisioning: the profile is only loaded when the user is unknown.
  async provisionFromAuth(request: AuthProvisionRequest): Promise<User> {
    const { authId, loadProfile } = request;
    const existing = await this.findByAuth(authId);
    if (existing) {
      return existing;
    }

    const profile = await loadProfile();
    return this.prisma.user.upsert({
      where: { auth_id: authId },
      create: {
        auth_id: authId,
        email: profile.email,
        name: profile.name,
        role: UserRole.USER,
      },
      update: { email: profile.email, name: profile.name },
    });
  }
}
