import { Injectable } from "@nestjs/common";
import { Prisma, type User } from "@prisma/client";

import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
