import { RegistrationStatus } from "@prisma/client";

// Seats stay held for these; leaving them gives the seats back.
export const SEAT_HOLDING: readonly RegistrationStatus[] = [
  RegistrationStatus.PENDING,
  RegistrationStatus.APPROVED,
  RegistrationStatus.CONFIRMED,
];

// Customers can back out until the studio has confirmed payment.
export const CUSTOMER_CANCELLABLE: readonly RegistrationStatus[] = [
  RegistrationStatus.PENDING,
  RegistrationStatus.APPROVED,
];

const ADMIN_TRANSITIONS: Record<
  RegistrationStatus,
  readonly RegistrationStatus[]
> = {
  [RegistrationStatus.PENDING]: [
    RegistrationStatus.APPROVED,
    RegistrationStatus.CONFIRMED,
    RegistrationStatus.REJECTED,
    RegistrationStatus.CANCELLED,
  ],
  [RegistrationStatus.APPROVED]: [
    RegistrationStatus.CONFIRMED,
    RegistrationStatus.REJECTED,
    RegistrationStatus.CANCELLED,
  ],
  [RegistrationStatus.CONFIRMED]: [RegistrationStatus.CANCELLED],
  [RegistrationStatus.REJECTED]: [],
  [RegistrationStatus.CANCELLED]: [],
};

export function canTransition(
  from: RegistrationStatus,
  to: RegistrationStatus,
): boolean {
  return ADMIN_TRANSITIONS[from].includes(to);
}

export const STATUS_TIMESTAMP: Partial<
  Record<
    RegistrationStatus,
    "approved_at" | "confirmed_at" | "rejected_at" | "cancelled_at"
  >
> = {
  [RegistrationStatus.APPROVED]: "approved_at",
  [RegistrationStatus.CONFIRMED]: "confirmed_at",
  [RegistrationStatus.REJECTED]: "rejected_at",
  [RegistrationStatus.CANCELLED]: "cancelled_at",
};

export function releasesSeats(
  from: RegistrationStatus,
  to: RegistrationStatus,
): boolean {
  return SEAT_HOLDING.includes(from) && !SEAT_HOLDING.includes(to);
}

export function takesSeats(
  from: RegistrationStatus,
  to: RegistrationStatus,
): boolean {
  return !SEAT_HOLDING.includes(from) && SEAT_HOLDING.includes(to);
}
