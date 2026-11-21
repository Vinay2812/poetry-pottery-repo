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

// Each label names the same state the shopper reads, in the order things happen.
const ORDER_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Awaiting confirmation",
  [OrderStatus.Confirmed]: "Awaiting payment",
  [OrderStatus.Paid]: "Paid",
  [OrderStatus.Shipped]: "Shipped",
  [OrderStatus.Delivered]: "Delivered",
  [OrderStatus.Cancelled]: "Cancelled",
  [OrderStatus.Refunded]: "Refunded",
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_LABEL[status];
}

/** What an approved booking holds: a wheel for a session, seats for an event. */
export type RegistrationHold = "wheel" | "seat";

const REGISTRATION_LABEL: Record<
  Exclude<RegistrationStatus, RegistrationStatus.Approved>,
  string
> = {
  [RegistrationStatus.Pending]: "Awaiting approval",
  [RegistrationStatus.Confirmed]: "Paid, confirmed",
  [RegistrationStatus.Rejected]: "Turned down",
  [RegistrationStatus.Cancelled]: "Cancelled",
};

const HELD_LABEL: Record<RegistrationHold, string> = {
  wheel: "Wheel held, awaiting payment",
  seat: "Seat held, awaiting payment",
};

export function registrationStatusLabel(
  status: RegistrationStatus,
  hold: RegistrationHold,
): string {
  if (status === RegistrationStatus.Approved) return HELD_LABEL[hold];
  return REGISTRATION_LABEL[status];
}

const ORDER_FLOW: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Confirmed,
  OrderStatus.Paid,
  OrderStatus.Shipped,
  OrderStatus.Delivered,
  OrderStatus.Cancelled,
  OrderStatus.Refunded,
];

const REGISTRATION_FLOW: RegistrationStatus[] = [
  RegistrationStatus.Pending,
  RegistrationStatus.Approved,
  RegistrationStatus.Confirmed,
  RegistrationStatus.Rejected,
  RegistrationStatus.Cancelled,
];

/** Status filters list the states in the order they happen, in the words the pills use. */
export function orderStatusOptions(): { value: string; label: string }[] {
  return ORDER_FLOW.map((value) => ({ value, label: orderStatusLabel(value) }));
}

export function registrationStatusOptions(
  hold: RegistrationHold,
): { value: string; label: string }[] {
  return REGISTRATION_FLOW.map((value) => ({
    value,
    label: registrationStatusLabel(value, hold),
  }));
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

const REGISTRATION_ACTION_LABEL: Record<
  Exclude<RegistrationStatus, RegistrationStatus.Approved>,
  string
> = {
  [RegistrationStatus.Pending]: "Back to awaiting approval",
  [RegistrationStatus.Confirmed]: "Confirm as paid",
  [RegistrationStatus.Rejected]: "Turn down",
  [RegistrationStatus.Cancelled]: "Cancel",
};

const APPROVE_LABEL: Record<RegistrationHold, string> = {
  wheel: "Approve, hold wheel",
  seat: "Approve, hold seats",
};

/** Each button says what the move does, not just the status it lands on. */
export function registrationActionLabel(
  status: RegistrationStatus,
  hold: RegistrationHold,
): string {
  if (status === RegistrationStatus.Approved) return APPROVE_LABEL[hold];
  return REGISTRATION_ACTION_LABEL[status];
}

export interface RegistrationAction {
  status: RegistrationStatus;
  label: string;
  // The first move that lets someone in gets the dark button.
  isPrimary: boolean;
}

/** The server says which moves are legal; each one is named and the way forward marked. */
export function toRegistrationActions(
  nextStatuses: RegistrationStatus[],
  hold: RegistrationHold,
): RegistrationAction[] {
  return nextStatuses.map((status, index) => ({
    status,
    label: registrationActionLabel(status, hold),
    isPrimary:
      index === 0 &&
      (status === RegistrationStatus.Approved ||
        status === RegistrationStatus.Confirmed),
  }));
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

const HEX_COLOUR = /^#[0-9a-f]{6}$/i;

/** A swatch beside a hex field only paints once the value is a real colour. */
export function toPreviewColour(value: string): string | null {
  const trimmed = value.trim();
  return HEX_COLOUR.test(trimmed) ? trimmed : null;
}

/** The id of the hint or error under a field; the control points its aria-describedby here. */
export function adminFieldMessageId(id: string): string {
  return `${id}-message`;
}
