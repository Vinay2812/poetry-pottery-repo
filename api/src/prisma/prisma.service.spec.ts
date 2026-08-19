import { AsyncLocalStorage } from "node:async_hooks";

import type { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService, withAmbientTransactions } from "./prisma.service";

const rootDelegate = { source: "root" };
const txDelegate = { source: "tx" };
const txClient = { user: txDelegate } as unknown as Prisma.TransactionClient;

// A stand-in with stable delegate identity; withTransaction is the real implementation.
function makeService() {
  const base = {
    txStore: new AsyncLocalStorage<Prisma.TransactionClient>(),
    user: rootDelegate,
    $transaction: vi.fn(
      (fn: (tx: Prisma.TransactionClient) => Promise<unknown>) => fn(txClient),
    ),
  };
  const withTransaction = PrismaService.prototype.withTransaction.bind(
    base as unknown as PrismaService,
  );
  return { ...base, withTransaction };
}

describe("withAmbientTransactions", () => {
  let service: ReturnType<typeof makeService>;
  let proxy: PrismaService;

  beforeEach(() => {
    service = makeService();
    proxy = withAmbientTransactions(service as unknown as PrismaService);
  });

  it("resolves model delegates on the real client outside a transaction", () => {
    expect(proxy.user).toBe(rootDelegate);
  });

  it("resolves model delegates on the transaction client inside withTransaction", async () => {
    await proxy.withTransaction(() => {
      expect(proxy.user).toBe(txDelegate);
      return Promise.resolve();
    });
  });

  it("falls back to the real client after the transaction ends", async () => {
    await proxy.withTransaction(() => Promise.resolve());

    expect(proxy.user).toBe(rootDelegate);
  });

  it("returns the callback result", async () => {
    await expect(
      proxy.withTransaction(() => Promise.resolve(42)),
    ).resolves.toBe(42);
  });

  it("joins the outer transaction instead of nesting", async () => {
    await proxy.withTransaction(async () => {
      await proxy.withTransaction(() => {
        expect(proxy.user).toBe(txDelegate);
        return Promise.resolve();
      });
    });

    expect(service.$transaction).toHaveBeenCalledTimes(1);
  });

  it("keeps client-only members on the real client inside a transaction", async () => {
    await proxy.withTransaction(() => {
      expect(proxy.txStore).toBe(service.txStore);
      return Promise.resolve();
    });
  });
});
