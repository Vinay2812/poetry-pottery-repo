import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CouponKind, Prisma } from "@prisma/client";

import { clampPage, toPageInfo } from "@/common/pagination/pagination";
import { PrismaService } from "@/prisma/prisma.service";
import { normaliseCouponCode } from "@/features/orders/coupons";
import { searchTerm } from "../admin.type";
import { rethrowMissing } from "../missing-row";
import type {
  AdminCoupon,
  AdminCouponInput,
  AdminCouponsFilterInput,
  AdminCouponsResult,
} from "./coupons.type";

const MAX_LIMIT = 60;
const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,23}$/;

export interface CouponFields {
  code: string;
  kind: CouponKind;
  value: number;
  min_order: number;
  max_uses: number | null;
  starts_at: Date | null;
  expires_at: Date | null;
  is_active: boolean;
}

// One place decides what a usable code looks like, for both create and update.
export function parseCoupon(input: AdminCouponInput): CouponFields {
  const code = normaliseCouponCode(input.code);
  if (code === null || !CODE_PATTERN.test(code)) {
    throw new BadRequestException(
      "A code is 3 to 24 characters of letters, digits and dashes",
    );
  }
  if (!Number.isInteger(input.value) || input.value < 1) {
    throw new BadRequestException("A code has to be worth something");
  }
  if (input.kind === CouponKind.PERCENT && input.value > 100) {
    throw new BadRequestException("A percentage code cannot exceed 100");
  }
  const min_order = input.min_order ?? 0;
  if (!Number.isInteger(min_order) || min_order < 0) {
    throw new BadRequestException(
      "The minimum order must be a whole number of rupees",
    );
  }
  const max_uses = input.max_uses ?? null;
  if (max_uses !== null && (!Number.isInteger(max_uses) || max_uses < 1)) {
    throw new BadRequestException("A use limit must be at least one");
  }
  const starts_at = input.starts_at ?? null;
  const expires_at = input.expires_at ?? null;
  if (starts_at && expires_at && expires_at <= starts_at) {
    throw new BadRequestException("A code must expire after it starts");
  }
  return {
    code,
    kind: input.kind,
    value: input.value,
    min_order,
    max_uses,
    starts_at,
    expires_at,
    is_active: input.is_active ?? true,
  };
}

@Injectable()
export class AdminCouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: AdminCouponsFilterInput): Promise<AdminCouponsResult> {
    const bounds = clampPage(filter.page, filter.limit, MAX_LIMIT);
    const term = searchTerm(filter.search);
    const where: Prisma.CouponWhereInput = {
      ...(term ? { code: { contains: term.toUpperCase() } } : {}),
      ...(filter.is_active == null ? {} : { is_active: filter.is_active }),
    };
    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: bounds.skip,
        take: bounds.limit,
      }),
      this.prisma.coupon.count({ where }),
    ]);
    return { items, page_info: toPageInfo(bounds, total) };
  }

  async create(input: AdminCouponInput): Promise<AdminCoupon> {
    const fields = parseCoupon(input);
    return this.prisma.coupon.create({ data: fields }).catch(rethrowDuplicate);
  }

  async update(id: number, input: AdminCouponInput): Promise<AdminCoupon> {
    const fields = parseCoupon(input);
    const current = await this.prisma.coupon.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException("Code not found");
    }
    // uses_count belongs to the orders that redeemed it, never to the edit form.
    return this.prisma.coupon
      .update({ where: { id }, data: fields })
      .catch(rethrowDuplicate);
  }

  async remove(id: number): Promise<boolean> {
    await this.prisma.coupon
      .delete({ where: { id } })
      .catch(rethrowMissing("Code not found"));
    return true;
  }
}

function rethrowDuplicate(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new ConflictException("That code already exists");
  }
  throw error;
}
