import { Injectable, NotFoundException } from "@nestjs/common";
import type { Address as AddressRow } from "@prisma/client";

import { PrismaService } from "@/prisma/prisma.service";
import { parseAddressInput } from "./address-validation";
import type { Address, AddressInput } from "./addresses.type";

export function toAddress(row: AddressRow): Address {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    landmark: row.landmark,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    is_default: row.is_default,
  };
}

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: number): Promise<Address[]> {
    const rows = await this.prisma.address.findMany({
      where: { user_id: userId },
      orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
    });
    return rows.map(toAddress);
  }

  async create(userId: number, input: AddressInput): Promise<Address> {
    const fields = parseAddressInput(input);
    const row = await this.prisma.withTransaction(async () => {
      const existing = await this.prisma.address.count({
        where: { user_id: userId },
      });
      const isDefault = fields.is_default || existing === 0;
      if (isDefault) {
        await this.clearDefaults(userId);
      }
      return this.prisma.address.create({
        data: { ...fields, user_id: userId, is_default: isDefault },
      });
    });
    return toAddress(row);
  }

  async update(
    userId: number,
    id: number,
    input: AddressInput,
  ): Promise<Address> {
    const fields = parseAddressInput(input);
    const existing = await this.findOwned(userId, id);
    const row = await this.prisma.withTransaction(async () => {
      // Editing the default never leaves the user without one.
      const isDefault = fields.is_default || existing.is_default;
      if (isDefault) {
        await this.clearDefaults(userId, id);
      }
      return this.prisma.address.update({
        where: { id },
        data: { ...fields, is_default: isDefault },
      });
    });
    return toAddress(row);
  }

  async remove(userId: number, id: number): Promise<boolean> {
    const existing = await this.findOwned(userId, id);
    await this.prisma.withTransaction(async () => {
      await this.prisma.address.delete({ where: { id } });
      if (!existing.is_default) return;
      const next = await this.prisma.address.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
      });
      if (next) {
        await this.prisma.address.update({
          where: { id: next.id },
          data: { is_default: true },
        });
      }
    });
    return true;
  }

  async setDefault(userId: number, id: number): Promise<Address> {
    await this.findOwned(userId, id);
    const row = await this.prisma.withTransaction(async () => {
      await this.clearDefaults(userId, id);
      return this.prisma.address.update({
        where: { id },
        data: { is_default: true },
      });
    });
    return toAddress(row);
  }

  private async findOwned(userId: number, id: number): Promise<AddressRow> {
    const row = await this.prisma.address.findFirst({
      where: { id, user_id: userId },
    });
    if (!row) {
      throw new NotFoundException("Address not found");
    }
    return row;
  }

  private async clearDefaults(
    userId: number,
    exceptId?: number,
  ): Promise<void> {
    await this.prisma.address.updateMany({
      where: {
        user_id: userId,
        is_default: true,
        ...(exceptId === undefined ? {} : { id: { not: exceptId } }),
      },
      data: { is_default: false },
    });
  }
}
