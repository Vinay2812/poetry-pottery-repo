import { describe, expect, it } from "vitest";

import {
  afterDelete,
  type SavedAddress,
  sortByDefaultFirst,
  toAddressInput,
  toAddressLines,
  toFormValues,
  toOptimisticDefault,
  toPreferredAddressId,
  withDefaultOn,
} from "./types";

function address(overrides: Partial<SavedAddress> = {}): SavedAddress {
  return {
    id: 1,
    name: "Maya Iyer",
    phone: "9876543210",
    line1: "12 Kiln Lane",
    line2: null,
    landmark: null,
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    is_default: false,
    ...overrides,
  };
}

describe("toAddressInput", () => {
  it("sends blank optional lines as null", () => {
    const input = toAddressInput({
      ...toFormValues(address()),
      line2: "",
      landmark: "Near the old well",
    });
    expect(input.line2).toBeNull();
    expect(input.landmark).toBe("Near the old well");
  });
});

describe("toFormValues", () => {
  it("turns the nullable columns into empty fields", () => {
    expect(toFormValues(address()).line2).toBe("");
    expect(
      toFormValues(address({ landmark: "Behind the temple" })).landmark,
    ).toBe("Behind the temple");
  });
});

describe("toAddressLines", () => {
  it("joins only the parts that were filled in", () => {
    expect(
      toAddressLines(
        "12 Kiln Lane",
        null,
        null,
        "Bengaluru",
        "Karnataka",
        "560001",
      ),
    ).toBe("12 Kiln Lane, Bengaluru, Karnataka 560001");
    expect(
      toAddressLines(
        "12 Kiln Lane",
        "Apt 4",
        "Near the old well",
        "Bengaluru",
        "Karnataka",
        "560001",
      ),
    ).toBe(
      "12 Kiln Lane, Apt 4, Near the old well, Bengaluru, Karnataka 560001",
    );
  });
});

describe("toPreferredAddressId", () => {
  it("prefers the default, falls back to a lone address", () => {
    expect(
      toPreferredAddressId([
        address({ id: 1 }),
        address({ id: 2, is_default: true }),
      ]),
    ).toBe(2);
    expect(toPreferredAddressId([address({ id: 7 })])).toBe(7);
    expect(
      toPreferredAddressId([address({ id: 1 }), address({ id: 2 })]),
    ).toBeNull();
    expect(toPreferredAddressId([])).toBeNull();
  });
});

describe("sortByDefaultFirst", () => {
  it("lifts the default without reordering the rest", () => {
    const sorted = sortByDefaultFirst([
      address({ id: 1 }),
      address({ id: 2, is_default: true }),
      address({ id: 3 }),
    ]);
    expect(sorted.map((item) => item.id)).toEqual([2, 1, 3]);
  });
});

describe("withDefaultOn", () => {
  it("moves the flag onto one address and lifts it to the top", () => {
    const updated = withDefaultOn(
      [address({ id: 1, is_default: true }), address({ id: 2 })],
      2,
    );
    expect(updated.map((item) => item.id)).toEqual([2, 1]);
    expect(updated.map((item) => item.is_default)).toEqual([true, false]);
  });
});

describe("afterDelete", () => {
  it("drops the address and leaves the rest alone", () => {
    const list = [address({ id: 1 }), address({ id: 2 })];
    expect(afterDelete(list, 1).map((item) => item.id)).toEqual([2]);
  });

  it("promotes the newest address when the default goes", () => {
    const list = [
      address({ id: 3, is_default: true }),
      address({ id: 2 }),
      address({ id: 1 }),
    ];
    expect(afterDelete(list, 3)).toEqual([
      address({ id: 2, is_default: true }),
      address({ id: 1, is_default: false }),
    ]);
  });

  it("leaves the default alone when another address goes", () => {
    const list = [address({ id: 3, is_default: true }), address({ id: 2 })];
    expect(afterDelete(list, 2)).toEqual([
      address({ id: 3, is_default: true }),
    ]);
  });

  it("returns nothing when the last address goes", () => {
    expect(afterDelete([address({ id: 1, is_default: true })], 1)).toEqual([]);
  });
});

describe("toOptimisticDefault", () => {
  it("marks the address default and names its type for the cache", () => {
    expect(toOptimisticDefault(address({ id: 4 }))).toEqual({
      ...address({ id: 4, is_default: true }),
      __typename: "Address",
    });
  });
});
