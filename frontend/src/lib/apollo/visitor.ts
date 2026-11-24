// Header names the API reads; it trusts the address only alongside the shared key.
const VISITOR_IP_HEADER = "x-visitor-ip";
const VISITOR_KEY_HEADER = "x-visitor-key";

// The edge (Vercel, or nginx when self-hosted) sets x-real-ip to the caller it saw; x-forwarded-for is the fallback.
export function visitorIp(incoming: Headers): string | null {
  const real = incoming.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = incoming.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded ? forwarded : null;
}

// Server-side renders reach the API from one address; this names the visitor so each is limited alone.
export function visitorHeaders(
  incoming: Headers,
  secret: string | undefined,
): Record<string, string> {
  const ip = visitorIp(incoming);
  if (!secret || !ip) return {};
  return { [VISITOR_IP_HEADER]: ip, [VISITOR_KEY_HEADER]: secret };
}
