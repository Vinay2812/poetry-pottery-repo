import {
  EventStatus,
  OrderStatus,
  RegistrationStatus,
} from "@/graphql/generated/graphql";

import { formatEnumLabel } from "@/features/admin/shell/types";

import type { AdminStatusTone } from "./components/AdminStatusPill";

const ORDER_TONE: Record<OrderStatus, AdminStatusTone> = {
  [OrderStatus.Pending]: "warn",
  [OrderStatus.Confirmed]: "neutral",
  [OrderStatus.Paid]: "live",
  [OrderStatus.Shipped]: "live",
  [OrderStatus.Delivered]: "live",
  [OrderStatus.Cancelled]: "quiet",
  [OrderStatus.Refunded]: "quiet",
};

const REGISTRATION_TONE: Record<RegistrationStatus, AdminStatusTone> = {
  [RegistrationStatus.Pending]: "warn",
  [RegistrationStatus.Approved]: "neutral",
  [RegistrationStatus.Confirmed]: "live",
  [RegistrationStatus.Rejected]: "quiet",
  [RegistrationStatus.Cancelled]: "quiet",
};

const EVENT_TONE: Record<EventStatus, AdminStatusTone> = {
  [EventStatus.Draft]: "warn",
  [EventStatus.Published]: "live",
  [EventStatus.Completed]: "neutral",
  [EventStatus.Cancelled]: "quiet",
};

export function orderStatusTone(status: OrderStatus): AdminStatusTone {
  return ORDER_TONE[status];
}

export function registrationStatusTone(
  status: RegistrationStatus,
): AdminStatusTone {
  return REGISTRATION_TONE[status];
}

export function eventStatusTone(status: EventStatus): AdminStatusTone {
  return EVENT_TONE[status];
}

/** Filter dropdowns all read the same way: every member of the enum, sentence case. */
export function enumOptions(
  members: Record<string, string>,
): { value: string; label: string }[] {
  return Object.values(members).map((value) => ({
    value,
    label: formatEnumLabel(value),
  }));
}

// React Hook Form replays the default value itself, not a string, so an empty
// optional number arrives as null and must not be coerced to zero.
export function toNullableNumber(value: string | null): number | null {
  return value === null || value === "" ? null : Number(value);
}
