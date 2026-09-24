import { AsyncLocalStorage } from "node:async_hooks";

import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

import { env } from "@/config/env";
import { type LockKey, LockNamespace, toLockKey } from "./lock";

export interface TransactionOptions {
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

export type AfterCommitHook = () => Promise<void> | void;

export interface TransactionScope {
  tx: Prisma.TransactionClient;
  afterCommit: AfterCommitHook[];
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  readonly txStore = new AsyncLocalStorage<TransactionScope>();
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });
  }

  get inTransaction(): boolean {
    return this.txStore.getStore() !== undefined;
  }

  // Runs fn inside a transaction that all prisma calls in its async scope join; nested calls reuse
  // the outer transaction, and work queued with afterCommit runs once the outermost one has committed.
  async withTransaction<T>(
    fn: () => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    if (this.txStore.getStore()) {
      return fn();
    }
    const hooks: AfterCommitHook[] = [];
    const result = await this.$transaction(
      (tx) => this.txStore.run({ tx, afterCommit: hooks }, fn),
      options,
    );
    await this.runHooks(hooks);
    return result;
  }

  // Inside a transaction the callback waits for the commit and is dropped on rollback; outside it
  // runs now. Either way a failing callback is logged and never fails the request that queued it.
  afterCommit(fn: AfterCommitHook): Promise<void> {
    const scope = this.txStore.getStore();
    if (scope) {
      scope.afterCommit.push(fn);
      return Promise.resolve();
    }
    return this.runHooks([fn]);
  }

  // A transaction-scoped advisory lock; without a transaction it would release at once, so refuse.
  async lock(namespace: LockNamespace, key: LockKey): Promise<void> {
    if (!this.txStore.getStore()) {
      throw new Error(
        `Advisory lock ${LockNamespace[namespace]} needs an open transaction`,
      );
    }
    const value = toLockKey(key);
    if (typeof value === "number") {
      await this
        .$executeRaw`SELECT pg_advisory_xact_lock(${namespace}::int, ${value}::int)`;
      return;
    }
    await this
      .$executeRaw`SELECT pg_advisory_xact_lock(${namespace}::int, hashtext(${value}))`;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  private async runHooks(hooks: AfterCommitHook[]): Promise<void> {
    for (const hook of hooks) {
      try {
        await hook();
      } catch (error) {
        this.logger.error(
          `after-commit hook failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}

// Model delegates and raw queries resolve to the ambient transaction when one is active;
// lifecycle and transaction-control members always resolve to the real client.
export function withAmbientTransactions(service: PrismaService): PrismaService {
  return new Proxy(service, {
    get(target, prop, receiver): unknown {
      const tx = target.txStore.getStore()?.tx;
      if (tx && prop in tx) {
        return Reflect.get(tx, prop) as unknown;
      }
      return Reflect.get(target, prop, receiver) as unknown;
    },
  });
}
