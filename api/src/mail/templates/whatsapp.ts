import type { WhatsAppMessage } from "@prisma/client";

import { renderMail } from "./layout";
import type { MailBody } from "./newsletter";

function senderLabel(message: WhatsAppMessage): string {
  return message.name ?? message.email ?? "a visitor";
}

export function whatsAppStudioMail(message: WhatsAppMessage): MailBody {
  const body = renderMail({
    title: "A WhatsApp message from the website",
    intro: `${senderLabel(message)} opened WhatsApp from the site with this message ready to send.`,
    blocks: [
      { heading: "Message", lines: message.body.split("\n") },
      {
        heading: "Who sent it",
        lines: [
          `Name: ${message.name ?? "Not signed in"}`,
          ...(message.email ? [`Email: ${message.email}`] : []),
          ...(message.phone ? [`Phone: ${message.phone}`] : []),
          ...(message.reference ? [`Reference: ${message.reference}`] : []),
          `Kind: ${message.kind}`,
        ],
      },
      ...(message.page_url
        ? [
            {
              heading: "Sent from",
              lines: [],
              links: [{ label: message.page_url, href: message.page_url }],
            },
          ]
        : []),
    ],
  });
  return {
    subject: `WhatsApp: ${message.kind} from ${senderLabel(message)}`,
    ...body,
  };
}

export function whatsAppCustomerMail(message: WhatsAppMessage): MailBody {
  const body = renderMail({
    title: "A note from the studio",
    intro:
      "We have just sent you this on WhatsApp as well, so you have it in writing.",
    blocks: [
      { heading: "The note", lines: message.body.split("\n") },
      ...(message.reference
        ? [{ heading: "Reference", lines: [message.reference] }]
        : []),
    ],
  });
  return { subject: "A note from Poetry & Pottery", ...body };
}
