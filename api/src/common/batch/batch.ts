// Loads every key it is given in one go; the map must hold an entry for each of them.
export type BatchLoad<K, V> = (keys: K[]) => Promise<Map<K, V>>;

export interface Batch<K, V> {
  load(key: K): Promise<V>;
}

interface Waiter<V> {
  resolve: (value: V) => void;
  reject: (error: unknown) => void;
}

// Values are never cached past a batch, so a mutation later in the same request reads fresh rows.
export function createBatch<K, V extends NonNullable<unknown> | null>(
  loadMany: BatchLoad<K, V>,
): Batch<K, V> {
  let queue: Map<K, Waiter<V>[]> | null = null;

  const dispatch = (waiting: Map<K, Waiter<V>[]>): void => {
    // Started from a resolved promise so a synchronous throw still reaches every waiter.
    void Promise.resolve()
      .then(() => loadMany([...waiting.keys()]))
      .then(
        (values) => {
          for (const [key, waiters] of waiting) {
            const value = values.get(key);
            for (const waiter of waiters) {
              if (value === undefined) {
                waiter.reject(
                  new Error(`Batch load returned no value for ${String(key)}`),
                );
              } else {
                waiter.resolve(value);
              }
            }
          }
        },
        (error: unknown) => {
          for (const waiters of waiting.values()) {
            for (const waiter of waiters) waiter.reject(error);
          }
        },
      );
  };

  return {
    load(key: K): Promise<V> {
      return new Promise<V>((resolve, reject) => {
        if (!queue) {
          const opened = new Map<K, Waiter<V>[]>();
          queue = opened;
          // Waits out the current microtask queue, so resolvers that awaited something first still join.
          void Promise.resolve().then(() =>
            process.nextTick(() => {
              queue = null;
              dispatch(opened);
            }),
          );
        }
        const waiters = queue.get(key);
        if (waiters) {
          waiters.push({ resolve, reject });
        } else {
          queue.set(key, [{ resolve, reject }]);
        }
      });
    },
  };
}

// One batch per GraphQL request context and scope; the WeakMap lets it go with the request.
export class RequestBatch<K, V extends NonNullable<unknown> | null, S = void> {
  private readonly batches = new WeakMap<object, Map<S, Batch<K, V>>>();

  constructor(
    private readonly loadMany: (keys: K[], scope: S) => Promise<Map<K, V>>,
  ) {}

  load(context: object, key: K, scope: S): Promise<V> {
    let scoped = this.batches.get(context);
    if (!scoped) {
      scoped = new Map();
      this.batches.set(context, scoped);
    }
    let batch = scoped.get(scope);
    if (!batch) {
      batch = createBatch((keys) => this.loadMany(keys, scope));
      scoped.set(scope, batch);
    }
    return batch.load(key);
  }
}

// Every requested key gets a list, empty when no row belongs to it; row order is kept.
export function groupByKey<K, R>(
  keys: readonly K[],
  rows: readonly R[],
  keyOf: (row: R) => K | null,
): Map<K, R[]> {
  const groups = new Map<K, R[]>(keys.map((key) => [key, []]));
  for (const row of rows) {
    const key = keyOf(row);
    if (key !== null) groups.get(key)?.push(row);
  }
  return groups;
}
