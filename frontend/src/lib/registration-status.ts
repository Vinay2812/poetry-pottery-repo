import { RegistrationStatus } from "@/graphql/generated/graphql";

import type { StatusTone } from "./status-tone";
import type { TimelineStage } from "./timeline";

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

type RequestStage = TimelineStage<RegistrationStatus>;

export interface RequestStages {
  paid: RequestStage[];
  free: RequestStage[];
}

// Wheel sessions and event seats walk the same steps; only what is held and what is confirmed differ.
// A pending request already holds it, so for a paid one the step after is about payment;
// a free one skips payment and the studio confirms it straight away.
export function toRequestStages(
  heldLine: string,
  thing: string,
): RequestStages {
  const requested: RequestStage = {
    key: RegistrationStatus.Pending,
    label: "Requested",
    description: heldLine,
  };
  return {
    paid: [
      requested,
      {
        key: RegistrationStatus.Approved,
        label: "Approved",
        description: "Payment details are on WhatsApp.",
        upcoming:
          "We look over each request, then approve it and share payment details on WhatsApp.",
      },
      {
        key: RegistrationStatus.Confirmed,
        label: "Confirmed",
        description: "Paid and confirmed. Come in ten minutes early.",
        upcoming: "Confirmed as soon as your payment lands.",
      },
    ],
    free: [
      requested,
      {
        key: RegistrationStatus.Confirmed,
        label: "Confirmed",
        description: `Your ${thing} is confirmed. Come in ten minutes early.`,
        upcoming: `We look over each request, then confirm your ${thing}.`,
      },
    ],
  };
}

// A request still unanswered once its date has come no longer holds anything, so the studio can only turn it down.
export function isRequestLapsed(
  status: RegistrationStatus,
  startsAt: string,
  now = new Date(),
): boolean {
  return status === RegistrationStatus.Pending && new Date(startsAt) < now;
}

// Only the requested step's note changes; the steps and status words stay as they were.
export function withRequestedLine(
  stages: RequestStage[],
  line: string,
): RequestStage[] {
  return stages.map((stage) =>
    stage.key === RegistrationStatus.Pending
      ? { ...stage, description: line }
      : stage,
  );
}
