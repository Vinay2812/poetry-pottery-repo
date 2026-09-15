import { renderMail } from "./layout";

export interface MailBody {
  subject: string;
  html: string;
  text: string;
}

export function newsletterWelcomeMail(token: string): MailBody {
  const body = renderMail({
    title: "You are on the list",
    intro:
      "Thanks for subscribing. We send a short note when a new batch comes out of the kiln and when workshop dates open up — no more than twice a month.",
    cta: {
      label: "Unsubscribe",
      path: `/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
    },
  });
  return { subject: "Welcome to the Poetry & Pottery letter", ...body };
}
