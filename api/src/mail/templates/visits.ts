import type { StudioVisit } from "@prisma/client";

import { renderMail } from "./layout";
import type { MailBody } from "./newsletter";

function whenLine(visit: StudioVisit, timezone: string): string {
  const when = new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  return when.format(visit.starts_at);
}

export function studioVisitCancelledMail(
  visit: StudioVisit,
  timezone: string,
  reason: string | null,
): MailBody {
  const when = whenLine(visit, timezone);
  const body = renderMail({
    title: "Your studio visit is off",
    intro: `We have had to cancel the half hour you booked on ${when}. Sorry for the change.`,
    blocks: [
      {
        heading: "What was booked",
        lines: [`When: ${when}`, `Reference: ${visit.id}`],
      },
      ...(reason ? [{ heading: "Why", lines: reason.split("\n") }] : []),
    ],
    cta: { label: "Pick another window", path: "/visit" },
  });
  return { subject: `Studio visit cancelled · ${when}`, ...body };
}

export function studioVisitMail(
  visit: StudioVisit,
  timezone: string,
): MailBody {
  const when = whenLine(visit, timezone);
  const body = renderMail({
    title: "Someone is coming by",
    intro: `${visit.name} booked a half hour at the studio on ${when}.`,
    blocks: [
      {
        heading: "The visit",
        lines: [
          `When: ${when}`,
          `Name: ${visit.name}`,
          `Phone: ${visit.phone}`,
          `Reference: ${visit.id}`,
        ],
        links: [
          {
            label: "Send them a WhatsApp confirmation",
            href: `https://wa.me/91${visit.phone}?text=${encodeURIComponent(
              `Hi ${visit.name}, we have you down at the studio on ${when}. See you then.`,
            )}`,
          },
        ],
      },
      ...(visit.note
        ? [{ heading: "They said", lines: visit.note.split("\n") }]
        : []),
    ],
  });
  return { subject: `Studio visit · ${when}`, ...body };
}
