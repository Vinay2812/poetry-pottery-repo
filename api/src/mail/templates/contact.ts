import type { ContactMessage } from "@prisma/client";

import { renderMail } from "./layout";
import type { MailBody } from "./newsletter";

function senderLines(message: ContactMessage): string[] {
  return [
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    ...(message.phone ? [`Phone: ${message.phone}`] : []),
    ...(message.subject ? [`Subject: ${message.subject}`] : []),
  ];
}

export function contactMessageStudioMail(message: ContactMessage): MailBody {
  const body = renderMail({
    title: "New message from the website",
    intro: `${message.name} sent a message through the contact form. Reply to ${message.email}.`,
    blocks: [
      { heading: "Sender", lines: senderLines(message) },
      { heading: "Message", lines: message.message.split("\n") },
    ],
  });
  return {
    subject: `Contact form · ${message.subject ?? message.name}`,
    ...body,
  };
}

export function contactAcknowledgementMail(message: ContactMessage): MailBody {
  const body = renderMail({
    title: "We got your message",
    intro: `Thanks for writing in, ${message.name}. Someone from the studio will get back to you within two working days.`,
    blocks: [{ heading: "What you sent", lines: message.message.split("\n") }],
  });
  return { subject: "We got your message · Poetry & Pottery", ...body };
}
