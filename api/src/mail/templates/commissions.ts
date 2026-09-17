import type { CommissionRequest } from "@prisma/client";

import { renderMail } from "./layout";
import type { MailBody } from "./newsletter";

function briefLines(request: CommissionRequest): string[] {
  return [
    `Piece: ${request.piece_type}`,
    `Size: ${request.size}`,
    `Glaze: ${request.glaze}`,
    ...(request.carved_words
      ? [`Words to carve: ${request.carved_words}`]
      : []),
  ];
}

export function commissionStudioMail(request: CommissionRequest): MailBody {
  const body = renderMail({
    title: "A new commission brief",
    intro: `${request.name} wants a piece made. Reply to ${request.email}.`,
    blocks: [
      { heading: "The piece", lines: briefLines(request) },
      ...(request.notes
        ? [{ heading: "Notes", lines: request.notes.split("\n") }]
        : []),
      {
        heading: "Who to write back to",
        lines: [
          `Name: ${request.name}`,
          `Email: ${request.email}`,
          ...(request.phone ? [`Phone: ${request.phone}`] : []),
          `Reference: ${request.id}`,
        ],
      },
      ...(request.reference_image_urls.length > 0
        ? [
            {
              heading: "Reference photos",
              lines: [],
              links: request.reference_image_urls.map((href, index) => ({
                label: `Photo ${index + 1}`,
                href,
              })),
            },
          ]
        : []),
    ],
  });
  return { subject: `Commission brief · ${request.piece_type}`, ...body };
}

export function commissionAcknowledgementMail(
  request: CommissionRequest,
): MailBody {
  const body = renderMail({
    title: "Your brief is with us",
    intro: `Thanks, ${request.name}. We will send a sketch within two days, and the piece ships in about ten days once you say yes.`,
    blocks: [
      { heading: "What you asked for", lines: briefLines(request) },
      { heading: "Your reference", lines: [request.id] },
    ],
  });
  return { subject: "Your brief is with us · Poetry & Pottery", ...body };
}
