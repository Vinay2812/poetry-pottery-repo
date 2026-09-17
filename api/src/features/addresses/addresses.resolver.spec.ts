import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthGuard } from "@/common/guards/auth.guard";
import { AddressesResolver } from "./addresses.resolver";
import { AddressesService } from "./addresses.service";
import type { Address, AddressInput } from "./addresses.type";

function guardsOn(prototype: object, field: string): unknown[] {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    prototype,
    field,
  )?.value;
  // A misspelt field would otherwise look like an unguarded one.
  if (typeof handler !== "function") {
    throw new Error(`${field} is not a resolver field`);
  }
  const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, handler);
  return Array.isArray(guards) ? (guards as unknown[]) : [];
}

function session(dbUserId: number): AuthUser {
  return {
    db_user_id: dbUserId,
    role: UserRole.USER,
    auth_id: `user_${dbUserId}`,
  };
}

function makeAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: 1,
    name: "Potter",
    phone: "9876543210",
    line1: "1 Kiln Lane",
    line2: null,
    landmark: null,
    city: "Sangli",
    state: "Maharashtra",
    pincode: "416416",
    is_default: false,
    ...overrides,
  };
}

function makeAddressInput(overrides: Partial<AddressInput> = {}): AddressInput {
  return {
    name: "Potter",
    phone: "9876543210",
    line1: "1 Kiln Lane",
    city: "Sangli",
    state: "Maharashtra",
    pincode: "416416",
    ...overrides,
  };
}

const addressesMock = {
  list: vi.fn<AddressesService["list"]>(),
  create: vi.fn<AddressesService["create"]>(),
  update: vi.fn<AddressesService["update"]>(),
  remove: vi.fn<AddressesService["remove"]>(),
  setDefault: vi.fn<AddressesService["setDefault"]>(),
};

describe("AddressesResolver", () => {
  let resolver: AddressesResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AddressesResolver,
        { provide: AddressesService, useValue: addressesMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    resolver = moduleRef.get(AddressesResolver);
  });

  it("lists the addresses belonging to the session", async () => {
    const addresses = [makeAddress()];
    addressesMock.list.mockResolvedValue(addresses);

    await expect(resolver.addresses(session(7))).resolves.toBe(addresses);
    expect(addressesMock.list).toHaveBeenCalledWith(7);
  });

  it("files a new address under the signed-in visitor", async () => {
    const created = makeAddress({ id: 12 });
    const input = makeAddressInput();
    addressesMock.create.mockResolvedValue(created);

    await expect(resolver.createAddress(session(7), input)).resolves.toBe(
      created,
    );
    expect(addressesMock.create).toHaveBeenCalledWith(7, input);
  });

  it("passes the owner ahead of the address id on update", async () => {
    const updated = makeAddress({ id: 3, city: "Kolhapur" });
    const input = makeAddressInput({ city: "Kolhapur" });
    addressesMock.update.mockResolvedValue(updated);

    await expect(resolver.updateAddress(session(7), 3, input)).resolves.toBe(
      updated,
    );
    expect(addressesMock.update).toHaveBeenCalledWith(7, 3, input);
  });

  it("scopes deletion to the owner so ids alone cannot reach another shelf", async () => {
    addressesMock.remove.mockResolvedValue(true);

    await expect(resolver.deleteAddress(session(7), 3)).resolves.toBe(true);
    expect(addressesMock.remove).toHaveBeenCalledWith(7, 3);
    expect(addressesMock.remove).not.toHaveBeenCalledWith(3, 3);
  });

  it("scopes the default flag to the owner", async () => {
    const address = makeAddress({ id: 3, is_default: true });
    addressesMock.setDefault.mockResolvedValue(address);

    await expect(resolver.setDefaultAddress(session(7), 3)).resolves.toBe(
      address,
    );
    expect(addressesMock.setDefault).toHaveBeenCalledWith(7, 3);
  });

  it("takes the owner from the session, never from the arguments", async () => {
    addressesMock.list.mockResolvedValue([]);
    addressesMock.remove.mockResolvedValue(true);

    await resolver.addresses(session(7));
    await resolver.addresses(session(8));
    await resolver.deleteAddress(session(8), 7);

    expect(addressesMock.list).toHaveBeenNthCalledWith(1, 7);
    expect(addressesMock.list).toHaveBeenNthCalledWith(2, 8);
    expect(addressesMock.remove).toHaveBeenCalledWith(8, 7);
  });

  it("guards every field with the authentication guard", () => {
    const fields = [
      "addresses",
      "createAddress",
      "updateAddress",
      "deleteAddress",
      "setDefaultAddress",
    ];

    for (const field of fields) {
      expect(guardsOn(AddressesResolver.prototype, field)).toEqual([AuthGuard]);
    }
  });
});
