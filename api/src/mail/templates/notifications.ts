import { env } from "@/config/env";
import { renderMail } from "./layout";
import type { MailBody } from "./newsletter";

export function backInStockMail(
  productName: string,
  productSlug: string,
  token: string,
): MailBody {
  const stopHref = `${env.FRONTEND_URL}/notify/unsubscribe?token=${encodeURIComponent(token)}`;
  const body = renderMail({
    title: "It is out of the kiln",
    intro: `${productName} is back on the shelf. Small batches go quickly, so have a look while it is there.`,
    blocks: [
      {
        lines: [],
        links: [{ label: "Stop watching this piece", href: stopHref }],
      },
    ],
    cta: { label: "See the piece", path: `/products/${productSlug}` },
  });
  return { subject: `${productName} is back`, ...body };
}
