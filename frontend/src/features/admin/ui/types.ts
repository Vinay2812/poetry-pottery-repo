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

// The shopper's own words for each order state, so both sides name it the same way.
const ORDER_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Awaiting confirmation",
  [OrderStatus.Confirmed]: "Confirmed, awaiting payment",
  [OrderStatus.Paid]: "Paid",
  [OrderStatus.Shipped]: "Shipped",
  [OrderStatus.Delivered]: "Delivered",
  [OrderStatus.Cancelled]: "Cancelled",
  [OrderStatus.Refunded]: "Refunded",
};

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_LABEL[status];
}

/** What a request holds from the moment it is made: a wheel for a session, seats for an event. */
export type RegistrationHold = "wheel" | "seat";

// A request already holds its wheel or seats, so approving only asks for payment.
const REGISTRATION_LABEL: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: "Awaiting approval",
  [RegistrationStatus.Approved]: "Approved, awaiting payment",
  [RegistrationStatus.Confirmed]: "Confirmed",
  [RegistrationStatus.Rejected]: "Not approved",
  [RegistrationStatus.Cancelled]: "Cancelled",
};

export function registrationStatusLabel(status: RegistrationStatus): string {
  return REGISTRATION_LABEL[status];
}

const HOLD_NOTE: Record<RegistrationHold, string> = {
  wheel:
    "A request holds its wheel from the moment it's made; turning it down frees it.",
  seat: "A request holds its seats from the moment it's made; turning it down frees them.",
};

export function registrationHoldNote(hold: RegistrationHold): string {
  return HOLD_NOTE[hold];
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

export function registrationStatusOptions(): {
  value: string;
  label: string;
}[] {
  return REGISTRATION_FLOW.map((value) => ({
    value,
    label: registrationStatusLabel(value),
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

// No move ever leads back to pending, so it has no button.
type RegistrationMoveTarget = Exclude<
  RegistrationStatus,
  RegistrationStatus.Pending
>;

const REGISTRATION_ACTION_LABEL: Record<
  Exclude<RegistrationMoveTarget, RegistrationStatus.Cancelled>,
  string
> = {
  [RegistrationStatus.Approved]: "Approve, ask for payment",
  [RegistrationStatus.Confirmed]: "Confirm as paid",
  [RegistrationStatus.Rejected]: "Turn down",
};

const CANCEL_LABEL: Record<RegistrationHold, string> = {
  wheel: "Cancel booking",
  seat: "Cancel registration",
};

function isMoveTarget(
  status: RegistrationStatus,
): status is RegistrationMoveTarget {
  return status !== RegistrationStatus.Pending;
}

/** Each button says what the move does, not just the status it lands on. */
function registrationActionLabel(
  status: RegistrationMoveTarget,
  hold: RegistrationHold,
): string {
  if (status === RegistrationStatus.Cancelled) return CANCEL_LABEL[hold];
  return REGISTRATION_ACTION_LABEL[status];
}

export interface RegistrationAction {
  status: RegistrationStatus;
  label: string;
  // The first move that lets someone in gets the dark button.
  isPrimary: boolean;
  // Turning down and cancelling read in red, as Cancel and Refund do on an order.
  isDestructive: boolean;
}

// One "no" per state: a request is turned down, an approved booking is cancelled,
// since its guest already has the approval email.
const SPARE_NO: Partial<Record<RegistrationStatus, RegistrationStatus>> = {
  [RegistrationStatus.Pending]: RegistrationStatus.Cancelled,
  [RegistrationStatus.Approved]: RegistrationStatus.Rejected,
};

/** The server says which moves are legal; each one is named and the way forward marked. */
export function toRegistrationActions(
  current: RegistrationStatus,
  nextStatuses: RegistrationStatus[],
  hold: RegistrationHold,
): RegistrationAction[] {
  return nextStatuses
    .filter(isMoveTarget)
    .filter((status) => status !== SPARE_NO[current])
    .map((status, index) => ({
      status,
      label: registrationActionLabel(status, hold),
      isPrimary:
        index === 0 &&
        (status === RegistrationStatus.Approved ||
          status === RegistrationStatus.Confirmed),
      isDestructive: registrationActionNeedsReason(status),
    }));
}

const HOLD_NOUN: Record<RegistrationHold, string> = {
  wheel: "booking",
  seat: "registration",
};

/** Turning someone away goes through a dialog; its title and button name the move. */
export function registrationClosingDialog(
  status: RegistrationStatus.Rejected | RegistrationStatus.Cancelled,
  hold: RegistrationHold,
): { title: string; confirmLabel: string } {
  const noun = HOLD_NOUN[hold];
  return status === RegistrationStatus.Rejected
    ? { title: `Turn this ${noun} down?`, confirmLabel: "Turn down" }
    : { title: `Cancel this ${noun}?`, confirmLabel: CANCEL_LABEL[hold] };
}

// The API fills these in when nobody typed a reason, so they say who closed it, not why.
// Kept word for word with features/workshops/workshops.service.ts, features/events/events.service.ts
// and features/admin/events/events.service.ts in the api app; the test below pins them.
const FILLED_IN_REASON: Record<string, string> = {
  "Cancelled by the guest": "Cancelled by the guest",
  "The studio called this one off": "Cancelled by the studio with the event",
};

/** One line under a closed booking: who closed it when that is all we know, else why. */
export function describeClosing(reason: string | null): string | null {
  const trimmed = reason?.trim() ?? "";
  if (trimmed === "") return null;
  return FILLED_IN_REASON[trimmed] ?? `Reason: ${trimmed}`;
}

/** Turning someone away is worth a sentence; letting them in is not. */
export function registrationActionNeedsReason(
  status: RegistrationStatus,
): status is RegistrationStatus.Rejected | RegistrationStatus.Cancelled {
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
