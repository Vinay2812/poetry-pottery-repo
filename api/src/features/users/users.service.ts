import { Injectable } from "@nestjs/common";
import { Prisma, type User } from "@prisma/client";

import { clampPage } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import type { UsersResponse } from "./users.type";

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

  // Not async on purpose: the lazy PrismaPromise stays composable with $transaction([...]).
  upsertUser(input: Prisma.UserUpsertArgs): Prisma.PrismaPromise<User> {
    return this.prisma.user.upsert(input);
  }
}
