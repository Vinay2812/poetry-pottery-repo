import { env } from "@/config/env";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export interface MailBlock {
  heading?: string;
  lines: string[];
}

export interface MailContent {
  title: string;
  intro: string;
  blocks?: MailBlock[];
  cta?: { label: string; path: string };
}

// Plain, table-free HTML that renders the same in Gmail, Outlook and Apple Mail.
export function renderMail(content: MailContent): {
  html: string;
  text: string;
} {
  const blocks = (content.blocks ?? [])
    .map((block) => {
      const heading = block.heading
        ? `<p style="margin:16px 0 4px;font-weight:600;color:#1a1a1a">${escapeHtml(block.heading)}</p>`
        : "";
      const lines = block.lines
        .map(
          (line) =>
            `<p style="margin:0 0 4px;color:#404040">${escapeHtml(line)}</p>`,
        )
        .join("");
      return heading + lines;
    })
    .join("");
  const ctaHref = content.cta ? `${env.FRONTEND_URL}${content.cta.path}` : "";
  const cta = content.cta
    ? `<p style="margin:24px 0 0"><a href="${ctaHref}" style="display:inline-block;background:#4f6f52;color:#fafaf9;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600">${escapeHtml(content.cta.label)}</a></p>`
    : "";

  const html = `<!doctype html><html><body style="margin:0;background:#f5f0e8;font-family:Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="margin:0 0 24px;font-size:20px;color:#4f6f52;font-weight:700">Poetry &amp; Pottery</p>
<div style="background:#ffffff;border-radius:16px;padding:28px">
<h1 style="margin:0 0 12px;font-size:22px;color:#1a1a1a">${escapeHtml(content.title)}</h1>
<p style="margin:0;color:#404040;line-height:1.5">${escapeHtml(content.intro)}</p>
${blocks}${cta}
</div>
<p style="margin:24px 0 0;font-size:12px;color:#737373">You are receiving this because you have an account at Poetry &amp; Pottery.</p>
</div></body></html>`;

  const textBlocks = (content.blocks ?? [])
    .map((block) =>
      [block.heading ?? "", ...block.lines].filter(Boolean).join("\n"),
    )
    .join("\n\n");
  const text = [
    content.title,
    "",
    content.intro,
    "",
    textBlocks,
    content.cta ? `${content.cta.label}: ${ctaHref}` : "",
  ]
    .filter((part) => part.length > 0)
    .join("\n");

  return { html, text };
}
