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
