import { AsyncLocalStorage } from "node:async_hooks";

import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

import { env } from "@/config/env";

export interface TransactionOptions {
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  readonly txStore = new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor() {
    super({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });
  }

  // Runs fn inside a transaction that all prisma calls in its async scope join; nested calls reuse the outer transaction.
  withTransaction<T>(
    fn: () => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    if (this.txStore.getStore()) {
      return fn();
    }
    return this.$transaction((tx) => this.txStore.run(tx, fn), options);
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

// Model delegates and raw queries resolve to the ambient transaction when one is active;
// lifecycle and transaction-control members always resolve to the real client.
export function withAmbientTransactions(service: PrismaService): PrismaService {
  return new Proxy(service, {
    get(target, prop, receiver): unknown {
      const tx = target.txStore.getStore();
      if (tx && prop in tx) {
        return Reflect.get(tx, prop) as unknown;
      }
      return Reflect.get(target, prop, receiver) as unknown;
    },
  });
}
