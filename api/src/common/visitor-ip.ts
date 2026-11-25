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

// "a::1" becomes eight hextets; an embedded IPv4 tail counts as the last two.
function ipv6Groups(ip: string): number[] | null {
  const address = (ip.split("%")[0] ?? "").toLowerCase();
  const halves = address.split("::");
  if (halves.length > 2) return null;
  const parse = (part: string | undefined): number[] | null => {
    if (!part) return [];
    const groups: number[] = [];
    for (const piece of part.split(":")) {
      if (piece.includes(".")) {
        const octets = piece.split(".").map(Number);
        const [a = 0, b = 0, c = 0, d = 0] = octets;
        groups.push((a << 8) | b, (c << 8) | d);
      } else {
        groups.push(parseInt(piece, 16));
      }
    }
    return groups.some(Number.isNaN) ? null : groups;
  };
  const head = parse(halves[0]);
  const tail = halves.length === 2 ? parse(halves[1]) : [];
  if (!head || !tail) return null;
  const missing = 8 - head.length - tail.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null;
  return [...head, ...new Array<number>(missing).fill(0), ...tail];
}

// One home connection gets a whole IPv6 /64, so limits count the prefix, not each address in it.
export function clientBucket(ip: string): string {
  if (isIP(ip) !== 6) return ip;
  const groups = ipv6Groups(ip);
  if (!groups) return ip;
  const isMappedV4 =
    groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff;
  if (isMappedV4) {
    const [high = 0, low = 0] = groups.slice(6);
    return [high >> 8, high & 0xff, low >> 8, low & 0xff].join(".");
  }
  return `${groups
    .slice(0, 4)
    .map((group) => group.toString(16))
    .join(":")}::/64`;
}
