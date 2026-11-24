import { createHash, timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import { isIP } from "node:net";

// Dependency-free so instrument.ts can import it before anything else loads.
export const VISITOR_IP_HEADER = "x-visitor-ip";
export const VISITOR_KEY_HEADER = "x-visitor-key";

// Hashing first gives both sides one length, so the comparison leaks neither the key nor its size.
function keyMatches(provided: string, expected: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(provided), digest(expected));
}

// The Next server renders on behalf of visitors; it may name one only while holding the shared key.
export function forwardedVisitorIp(
  headers: IncomingHttpHeaders | undefined,
  secret: string | undefined,
): string | null {
  const key = headers?.[VISITOR_KEY_HEADER];
  const ip = headers?.[VISITOR_IP_HEADER];
  if (!secret || typeof key !== "string" || typeof ip !== "string") {
    return null;
  }
  if (!keyMatches(key, secret)) return null;
  const visitor = ip.trim();
  return isIP(visitor) !== 0 ? visitor : null;
}
