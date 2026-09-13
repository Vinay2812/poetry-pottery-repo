import { headers } from "next/headers";

// Shareable absolute URL for the current request, used in prefilled WhatsApp messages.
export async function toAbsoluteUrl(path: string): Promise<string> {
  const list = await headers();
  const host =
    list.get("x-forwarded-host") ?? list.get("host") ?? "localhost:3030";
  const protocol =
    list.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}${path}`;
}
