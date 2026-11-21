import { RegistrationStatus } from "@/graphql/generated/graphql";

// Wheel sessions and event seats share one status, so the shopper and the studio read the same words.
const STATUS_LABEL: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: "Awaiting approval",
  [RegistrationStatus.Approved]: "Approved, awaiting payment",
  [RegistrationStatus.Confirmed]: "Confirmed",
  [RegistrationStatus.Rejected]: "Not approved",
  [RegistrationStatus.Cancelled]: "Cancelled",
};

export function toRegistrationStatusLabel(status: RegistrationStatus): string {
  return STATUS_LABEL[status];
}

// Cancelled and not-approved requests are over; nothing more happens to them.
export function isRegistrationClosed(status: RegistrationStatus): boolean {
  return (
    status === RegistrationStatus.Cancelled ||
    status === RegistrationStatus.Rejected
  );
}
