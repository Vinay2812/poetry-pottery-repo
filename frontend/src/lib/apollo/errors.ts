import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";

export const OFFLINE_MESSAGE =
  "We could not reach the studio. Check your connection and try again.";
export const THROTTLED_MESSAGE =
  "That was a lot of tries in a row. Wait a minute and try again.";

// The throttler's exception carries a bare string, so Nest attaches no status and only the words say 429.
const THROTTLED_PATTERN = /too many requests/i;

interface NestOriginalError {
  statusCode?: number;
  message?: string | string[];
}

// Nest's HTTP exception travels inside the GraphQL error as `extensions.originalError`, so
// its shape is described in exactly one place.
function readOriginalError(
  extensions: Record<string, unknown> | undefined | null,
): NestOriginalError | null {
  const original = extensions?.originalError;
  if (typeof original !== "object" || original === null) return null;
  const record = original as Record<string, unknown>;
  const statusCode =
    typeof record.statusCode === "number" ? record.statusCode : undefined;
  const message =
    typeof record.message === "string"
      ? record.message
      : Array.isArray(record.message)
        ? record.message.filter(
            (item): item is string => typeof item === "string",
          )
        : undefined;
  return { statusCode, message };
}

export function isNotFoundError(error: unknown): boolean {
  if (!CombinedGraphQLErrors.is(error)) return false;
  return error.errors.some(
    (item) => readOriginalError(item.extensions)?.statusCode === 404,
  );
}

// Nest prefixes some messages ("ThrottlerException: ..."); the reader only needs the sentence.
function toSentence(message: string | string[] | undefined): string {
  const raw = Array.isArray(message) ? message[0] : message;
  return (raw ?? "").replace(/^\w*(Exception|Error):\s*/, "").trim();
}

/** Turns anything a mutation or query can throw into a sentence worth putting in a toast. */
export function describeError(error: unknown, fallback: string): string {
  if (CombinedGraphQLErrors.is(error)) {
    const first = error.errors[0];
    const original = readOriginalError(first?.extensions);
    const sentence = toSentence(original?.message ?? first?.message);
    if (original?.statusCode === 429 || THROTTLED_PATTERN.test(sentence)) {
      return THROTTLED_MESSAGE;
    }
    return sentence || fallback;
  }
  if (ServerError.is(error)) {
    return error.statusCode === 429 ? THROTTLED_MESSAGE : fallback;
  }
  // fetch rejects with a bare TypeError when the network is gone; nothing else in the request path does.
  if (error instanceof TypeError) return OFFLINE_MESSAGE;
  if (error instanceof Error) return toSentence(error.message) || fallback;
  return fallback;
}
