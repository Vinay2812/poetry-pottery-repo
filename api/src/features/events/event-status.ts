import { EventStatus } from "@prisma/client";

// An evening that has run or been called off is the end of the line: nothing reopens it,
// so the refunds and the "we called it off" mails can only fire once.
const ADMIN_TRANSITIONS: Record<EventStatus, readonly EventStatus[]> = {
  [EventStatus.DRAFT]: [EventStatus.PUBLISHED, EventStatus.CANCELLED],
  [EventStatus.PUBLISHED]: [
    EventStatus.DRAFT,
    EventStatus.COMPLETED,
    EventStatus.CANCELLED,
  ],
  [EventStatus.COMPLETED]: [],
  [EventStatus.CANCELLED]: [],
};

export function canTransition(from: EventStatus, to: EventStatus): boolean {
  return ADMIN_TRANSITIONS[from].includes(to);
}
