import { describe, expect, it, vi } from "vitest";

import { createBatch, groupByKey, RequestBatch } from "./batch";

function doubling(): (keys: number[]) => Promise<Map<number, number>> {
  return vi.fn((keys: number[]) =>
    Promise.resolve(new Map(keys.map((key) => [key, key * 2]))),
  );
}

describe("createBatch", () => {
  it("loads the keys asked for in one tick together, each once", async () => {
    const load = doubling();
    const batch = createBatch(load);

    const values = await Promise.all([
      batch.load(1),
      batch.load(2),
      batch.load(1),
      batch.load(3),
    ]);

    expect(values).toEqual([2, 4, 2, 6]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith([1, 2, 3]);
  });

  it("still collects callers that awaited something before asking", async () => {
    const load = doubling();
    const batch = createBatch(load);
    const later = async (key: number): Promise<number> => {
      await Promise.resolve();
      await Promise.resolve();
      return batch.load(key);
    };

    await expect(
      Promise.all([batch.load(1), later(2), later(3)]),
    ).resolves.toEqual([2, 4, 6]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("starts a fresh load for keys asked for after a batch went out", async () => {
    const load = doubling();
    const batch = createBatch(load);

    await batch.load(1);
    await batch.load(1);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("rejects every waiter when the load fails", async () => {
    const batch = createBatch<number, number>(() =>
      Promise.reject(new Error("database down")),
    );

    const results = await Promise.allSettled([batch.load(1), batch.load(2)]);

    expect(results).toEqual([
      { status: "rejected", reason: new Error("database down") },
      { status: "rejected", reason: new Error("database down") },
    ]);
  });

  it("rejects every waiter when the load throws before returning a promise", async () => {
    const batch = createBatch<number, number>(() => {
      throw new Error("bad query");
    });

    await expect(batch.load(1)).rejects.toThrow("bad query");
  });

  it("rejects only the key the load left out", async () => {
    const batch = createBatch<number, string>(() =>
      Promise.resolve(new Map([[1, "one"]])),
    );

    const [one, two] = await Promise.allSettled([batch.load(1), batch.load(2)]);

    expect(one).toEqual({ status: "fulfilled", value: "one" });
    expect(two).toMatchObject({ status: "rejected" });
  });

  it("hands a null value through rather than treating it as missing", async () => {
    const batch = createBatch<number, string | null>((keys) =>
      Promise.resolve(new Map(keys.map((key) => [key, null]))),
    );

    await expect(batch.load(4)).resolves.toBeNull();
  });
});

describe("RequestBatch", () => {
  it("shares a batch within one request context", async () => {
    const load = vi.fn((keys: number[]) =>
      Promise.resolve(new Map(keys.map((key) => [key, key]))),
    );
    const batch = new RequestBatch(load);
    const context = {};

    await Promise.all([batch.load(context, 1), batch.load(context, 2)]);

    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith([1, 2], undefined);
  });

  it("never lets two requests share a load, even in the same tick", async () => {
    const load = vi.fn((keys: number[]) =>
      Promise.resolve(new Map(keys.map((key) => [key, key]))),
    );
    const batch = new RequestBatch(load);

    await Promise.all([batch.load({}, 1), batch.load({}, 1)]);

    expect(load).toHaveBeenCalledTimes(2);
    expect(load).toHaveBeenNthCalledWith(1, [1], undefined);
    expect(load).toHaveBeenNthCalledWith(2, [1], undefined);
  });

  it("keeps each scope, such as the signed-in user, in its own load", async () => {
    const load = vi.fn((keys: number[], userId: number | null) =>
      Promise.resolve(new Map(keys.map((key) => [key, `${userId}:${key}`]))),
    );
    const batch = new RequestBatch(load);
    const context = {};

    const values = await Promise.all([
      batch.load(context, 1, 7),
      batch.load(context, 1, null),
      batch.load(context, 2, 7),
    ]);

    expect(values).toEqual(["7:1", "null:1", "7:2"]);
    expect(load).toHaveBeenCalledTimes(2);
    expect(load).toHaveBeenCalledWith([1, 2], 7);
    expect(load).toHaveBeenCalledWith([1], null);
  });
});

describe("groupByKey", () => {
  it("gives every key a list in row order, empty when nothing belongs to it", () => {
    const rows = [
      { id: 1, owner: 5 },
      { id: 2, owner: null },
      { id: 3, owner: 4 },
      { id: 4, owner: 5 },
      { id: 5, owner: 9 },
    ];

    const groups = groupByKey([4, 5, 6], rows, (row) => row.owner);

    expect([...groups]).toEqual([
      [4, [{ id: 3, owner: 4 }]],
      [
        5,
        [
          { id: 1, owner: 5 },
          { id: 4, owner: 5 },
        ],
      ],
      [6, []],
    ]);
  });
});
