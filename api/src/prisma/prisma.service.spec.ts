import { AsyncLocalStorage } from "node:async_hooks";

import type { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LockNamespace, toLockKey } from "./lock";
import {
  PrismaService,
  type TransactionScope,
  withAmbientTransactions,
} from "./prisma.service";

const rootDelegate = { source: "root" };
const txDelegate = { source: "tx" };
const txClient = { user: txDelegate } as unknown as Prisma.TransactionClient;

type TxCallback = (tx: Prisma.TransactionClient) => Promise<unknown>;

// The real service methods over a stand-in client, so the ALS and hook logic under test is the
// real one; only $transaction is faked, running the callback against a fake transaction client.
function makeService() {
  const state = {
    txStore: new AsyncLocalStorage<TransactionScope>(),
    user: rootDelegate,
    logger: { error: vi.fn() },
    $executeRaw: vi.fn().mockResolvedValue(1),
    $transaction: vi.fn((fn: TxCallback) => fn(txClient)),
  };
  const service = Object.assign(
    Object.create(PrismaService.prototype) as PrismaService,
    state,
  );
  return { service, state };
}

describe("withAmbientTransactions", () => {
  let state: ReturnType<typeof makeService>["state"];
  let proxy: PrismaService;

  beforeEach(() => {
    const made = makeService();
    state = made.state;
    proxy = withAmbientTransactions(made.service);
  });

  it("resolves model delegates on the real client outside a transaction", () => {
    expect(proxy.user).toBe(rootDelegate);
  });

  it("resolves model delegates on the transaction client inside withTransaction", async () => {
    await proxy.withTransaction(() => {
      expect(proxy.user).toBe(txDelegate);
      expect(proxy.inTransaction).toBe(true);
      return Promise.resolve();
    });
  });

  it("falls back to the real client after the transaction ends", async () => {
    await proxy.withTransaction(() => Promise.resolve());

    expect(proxy.user).toBe(rootDelegate);
    expect(proxy.inTransaction).toBe(false);
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

    expect(state.$transaction).toHaveBeenCalledTimes(1);
  });

  it("keeps client-only members on the real client inside a transaction", async () => {
    await proxy.withTransaction(() => {
      expect(proxy.txStore).toBe(state.txStore);
      return Promise.resolve();
    });
  });
});

describe("afterCommit", () => {
  let state: ReturnType<typeof makeService>["state"];
  let proxy: PrismaService;

  beforeEach(() => {
    const made = makeService();
    state = made.state;
    proxy = withAmbientTransactions(made.service);
  });

  it("runs the callback at once outside a transaction", async () => {
    const ran = vi.fn();

    await proxy.afterCommit(ran);

    expect(ran).toHaveBeenCalledTimes(1);
  });

  it("holds callbacks until the outermost transaction has committed, in order", async () => {
    const trace: string[] = [];
    state.$transaction.mockImplementation(async (fn: TxCallback) => {
      const result = await fn(txClient);
      trace.push("commit");
      return result;
    });

    await proxy.withTransaction(async () => {
      await proxy.afterCommit(() => {
        trace.push("first");
      });
      await proxy.withTransaction(() =>
        proxy.afterCommit(() => {
          trace.push("nested");
        }),
      );
      trace.push("body done");
    });

    expect(trace).toEqual(["body done", "commit", "first", "nested"]);
  });

  it("runs callbacks outside the transaction scope, so their queries hit the real client", async () => {
    let seen: unknown = null;

    await proxy.withTransaction(() =>
      proxy.afterCommit(() => {
        seen = proxy.user;
      }),
    );

    expect(seen).toBe(rootDelegate);
  });

  it("drops every callback when the transaction rolls back", async () => {
    const ran = vi.fn();

    await expect(
      proxy.withTransaction(async () => {
        await proxy.afterCommit(ran);
        throw new Error("kiln fire");
      }),
    ).rejects.toThrow("kiln fire");

    expect(ran).not.toHaveBeenCalled();
  });

  it("logs a failing callback, runs the rest and still returns the result", async () => {
    const second = vi.fn();

    const result = await proxy.withTransaction(async () => {
      await proxy.afterCommit(() => Promise.reject(new Error("broker down")));
      await proxy.afterCommit(second);
      return "done";
    });

    expect(result).toBe("done");
    expect(second).toHaveBeenCalledTimes(1);
    expect(state.logger.error).toHaveBeenCalledWith(
      expect.stringContaining("broker down"),
    );
  });

  it("never throws for a failing callback outside a transaction either", async () => {
    await expect(
      proxy.afterCommit(() => {
        throw new Error("boom");
      }),
    ).resolves.toBeUndefined();

    expect(state.logger.error).toHaveBeenCalledWith(
      expect.stringContaining("boom"),
    );
  });
});

describe("lock", () => {
  let state: ReturnType<typeof makeService>["state"];
  let proxy: PrismaService;

  beforeEach(() => {
    const made = makeService();
    state = made.state;
    proxy = withAmbientTransactions(made.service);
  });

  it("refuses to take an advisory lock outside a transaction", async () => {
    await expect(proxy.lock(LockNamespace.WORKSHOP_CONFIG, 3)).rejects.toThrow(
      "needs an open transaction",
    );
    expect(state.$executeRaw).not.toHaveBeenCalled();
  });

  it("locks an integer key under its namespace with the two-int form", async () => {
    await proxy.withTransaction(() =>
      proxy.lock(LockNamespace.WORKSHOP_CONFIG, 3),
    );

    expect(state.$executeRaw).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringContaining("pg_advisory_xact_lock("),
      ]),
      LockNamespace.WORKSHOP_CONFIG,
      3,
    );
    expect(state.$executeRaw.mock.calls[0]?.[0]).not.toContainEqual(
      expect.stringContaining("hashtext"),
    );
  });

  it("hashes a string key inside the database", async () => {
    await proxy.withTransaction(() =>
      proxy.lock(LockNamespace.USER_PROVISION, "user_dev"),
    );

    expect(state.$executeRaw).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining("hashtext(")]),
      LockNamespace.USER_PROVISION,
      "user_dev",
    );
  });

  it("hashes a composite key as one joined string", async () => {
    await proxy.withTransaction(() =>
      proxy.lock(LockNamespace.CART_LINE, [12, 34]),
    );

    expect(state.$executeRaw).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining("hashtext(")]),
      LockNamespace.CART_LINE,
      "12:34",
    );
  });
});

describe("toLockKey", () => {
  it("passes integers through, keeps strings and joins composites", () => {
    expect(toLockKey(7)).toBe(7);
    expect(toLockKey("auth_1")).toBe("auth_1");
    expect(toLockKey([1, "a", 2])).toBe("1:a:2");
  });
});
