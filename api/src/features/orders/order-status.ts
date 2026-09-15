import { OrderStatus } from "@prisma/client";

// Customers may back out until the studio has recorded payment.
export const CUSTOMER_CANCELLABLE: readonly OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
];

// Stock is held from placement until the order is cancelled or refunded.
export const STOCK_HOLDING: readonly OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PAID,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

const ADMIN_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.PENDING]: [
    OrderStatus.CONFIRMED,
    OrderStatus.PAID,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.CONFIRMED]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [
    OrderStatus.SHIPPED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
  ],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.REFUNDED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ADMIN_TRANSITIONS[from].includes(to);
}

export const STATUS_TIMESTAMP: Partial<
  Record<
    OrderStatus,
    | "confirmed_at"
    | "paid_at"
    | "shipped_at"
    | "delivered_at"
    | "cancelled_at"
    | "refunded_at"
  >
> = {
  [OrderStatus.CONFIRMED]: "confirmed_at",
  [OrderStatus.PAID]: "paid_at",
  [OrderStatus.SHIPPED]: "shipped_at",
  [OrderStatus.DELIVERED]: "delivered_at",
  [OrderStatus.CANCELLED]: "cancelled_at",
  [OrderStatus.REFUNDED]: "refunded_at",
};
