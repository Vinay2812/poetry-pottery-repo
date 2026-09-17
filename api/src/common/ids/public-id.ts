import { customAlphabet } from "nanoid";

// No vowels or look-alike characters, so ids read cleanly over WhatsApp and phone.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const generate = customAlphabet(ALPHABET, 10);

export function newPublicId(prefix: "PP" | "EV" | "WS"): string {
  return `${prefix}-${generate()}`;
}

export const PUBLIC_ID_PATTERN =
  /^(PP|EV|WS)-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{10}$/;
