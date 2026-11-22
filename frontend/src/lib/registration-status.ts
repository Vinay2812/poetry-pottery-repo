import { RegistrationStatus } from "@/graphql/generated/graphql";

import type { StatusTone } from "./status-tone";

// Wheel sessions and event seats share one status, so the shopper and the studio read the same words.
const STATUS_LABEL: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: "Awaiting approval",
  [RegistrationStatus.Approved]: "Approved, awaiting payment",
  [RegistrationStatus.Confirmed]: "Confirmed",
  [RegistrationStatus.Rejected]: "Not approved",
  [RegistrationStatus.Cancelled]: "Cancelled",
};

// A free seat has nothing to pay, so one approved before free seats skipped the step reads plain "Approved".
export function toRegistrationStatusLabel(
  status: RegistrationStatus,
  isFree: boolean,
): string {
  if (isFree && status === RegistrationStatus.Approved) return "Approved";
  return STATUS_LABEL[status];
}

// Cancelled and not-approved requests are over; nothing more happens to them.
export function isRegistrationClosed(status: RegistrationStatus): boolean {
  return (
    status === RegistrationStatus.Cancelled ||
    status === RegistrationStatus.Rejected
  );
}

export function toRegistrationStatusTone(
  status: RegistrationStatus,
): StatusTone {
  if (isRegistrationClosed(status)) return "off";
  if (status === RegistrationStatus.Confirmed) return "done";
  if (status === RegistrationStatus.Pending) return "pending";
  return "active";
}
