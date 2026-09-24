// Each caller of an advisory lock owns one namespace, so a user id can never collide with a studio id.
export enum LockNamespace {
  WORKSHOP_CONFIG = 1,
  USER_PROVISION = 2,
  ROLE_CHANGE = 3,
  CART_LINE = 4,
}

export type LockKey = number | string | readonly (number | string)[];

// Integers lock as themselves; strings and composite keys are hashed by Postgres.
export function toLockKey(key: LockKey): number | string {
  if (typeof key === "number") return key;
  if (typeof key === "string") return key;
  return key.map(String).join(":");
}
