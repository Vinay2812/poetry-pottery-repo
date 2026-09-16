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

/** The URL only ever holds a string, so an unknown status filter is simply dropped. */
export function toRegistrationStatus(value: string): RegistrationStatus | null {
  return (
    Object.values(RegistrationStatus).find((member) => member === value) ?? null
  );
}

const REGISTRATION_ACTION_LABEL: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: "Move back to pending",
  [RegistrationStatus.Approved]: "Approve",
  [RegistrationStatus.Confirmed]: "Confirm",
  [RegistrationStatus.Rejected]: "Reject",
  [RegistrationStatus.Cancelled]: "Cancel",
};

export function registrationActionLabel(status: RegistrationStatus): string {
  return REGISTRATION_ACTION_LABEL[status];
}

/** Turning someone away is worth a sentence; letting them in is not. */
export function registrationActionNeedsReason(
  status: RegistrationStatus,
): boolean {
  return (
    status === RegistrationStatus.Rejected ||
    status === RegistrationStatus.Cancelled
  );
}

/** Rows fall back to the email when nobody has given us a name. */
export function toPersonName(name: string | null, email: string): string {
  return name && name.trim().length > 0 ? name : email;
}

/** An input[type=datetime-local] speaks local wall time; the API speaks ISO. */
export function toDateTimeLocal(iso: string | null): string {
  if (iso === null || iso === "") return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join("T");
}

export function fromDateTimeLocal(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
