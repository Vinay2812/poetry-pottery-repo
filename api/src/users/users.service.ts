import { Injectable } from "@nestjs/common";
import { Prisma, type User } from "@prisma/client";

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

  // Not async on purpose: the lazy PrismaPromise stays composable with $transaction([...]).
  upsertUser(input: Prisma.UserUpsertArgs): Prisma.PrismaPromise<User> {
    return this.prisma.user.upsert(input);
  }
}
