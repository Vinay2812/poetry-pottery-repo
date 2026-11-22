import { BadRequestException } from "@nestjs/common";
import { RegistrationStatus } from "@prisma/client";

// Seats stay held for these; leaving them gives the seats back.
export const SEAT_HOLDING: readonly RegistrationStatus[] = [
  RegistrationStatus.PENDING,
  RegistrationStatus.APPROVED,
  RegistrationStatus.CONFIRMED,
];

// Nothing is paid yet: the request is waiting on the studio or on the guest's payment.
export const CUSTOMER_CANCELLABLE: readonly RegistrationStatus[] = [
  RegistrationStatus.PENDING,
  RegistrationStatus.APPROVED,
];

// Confirmed with money taken; such a place is final for the guest.
export function isPaidPlace(
  status: RegistrationStatus,
  total: number,
): boolean {
  return status === RegistrationStatus.CONFIRMED && total > 0;
}

// Guests may withdraw before the date while nothing is paid, which includes a confirmed free place.
export function customerCanCancel(
  status: RegistrationStatus,
  total: number,
  startsAt: Date,
  now = new Date(),
): boolean {
  if (startsAt <= now) return false;
  return (
    CUSTOMER_CANCELLABLE.includes(status) ||
    (status === RegistrationStatus.CONFIRMED && total === 0)
  );
}

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

// Approved means waiting on payment, so a free seat skips it and is confirmed straight away.
function isPaymentStepForFreeSeat(
  to: RegistrationStatus,
  total: number,
): boolean {
  return to === RegistrationStatus.APPROVED && total === 0;
}

// Once a session or evening has begun, a request nobody answered can only be closed. A booking the
// studio already approved can still be confirmed, since the guest may have paid on the day.
function isLateAdmission(
  from: RegistrationStatus,
  to: RegistrationStatus,
  hasStarted: boolean,
): boolean {
  return (
    hasStarted &&
    from !== RegistrationStatus.APPROVED &&
    (to === RegistrationStatus.APPROVED || to === RegistrationStatus.CONFIRMED)
  );
}

export function hasStarted(startsAt: Date, now = new Date()): boolean {
  return startsAt < now;
}

// The studio's moves are the shared ones, less Approved for a seat with nothing to pay, and less
// letting an unanswered request in once the date has begun.
export function nextAdminStatuses(
  from: RegistrationStatus,
  total: number,
  startsAt: Date,
  now = new Date(),
): RegistrationStatus[] {
  const started = hasStarted(startsAt, now);
  return Object.values(RegistrationStatus).filter(
    (to) =>
      canTransition(from, to) &&
      !isPaymentStepForFreeSeat(to, total) &&
      !isLateAdmission(from, to, started),
  );
}

export function assertNotPaymentStepForFreeSeat(
  to: RegistrationStatus,
  total: number,
): void {
  if (isPaymentStepForFreeSeat(to, total)) {
    throw new BadRequestException(
      "A free seat has nothing to pay for, so confirm it instead",
    );
  }
}

export function assertNotLateAdmission(
  from: RegistrationStatus,
  to: RegistrationStatus,
  startsAt: Date,
  now = new Date(),
): void {
  if (isLateAdmission(from, to, hasStarted(startsAt, now))) {
    throw new BadRequestException(
      "This date has already begun, so the request can only be turned down or cancelled",
    );
  }
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
