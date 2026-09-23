import { format, type Logform } from "winston";

// Keys whose values identify a customer or unlock something; matched case-insensitively at any depth.
const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "password",
  "token",
  "secret",
  "email",
  "phone",
  "name",
  "address",
  "line1",
  "line2",
  "landmark",
  "pincode",
  "note",
  "notes",
  "message",
  "customer_note",
  "gift_note",
  "carved_words",
]);

// Winston's own fields; "message" is the log line itself, not a customer's note.
const LOG_FIELDS = new Set(["level", "message", "timestamp", "stack"]);

const REDACTED = "[redacted]";
const MAX_STRING = 200;
const MAX_DEPTH = 6;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return "[deep]";
  if (typeof value === "string") {
    return value.length > MAX_STRING
      ? `${value.slice(0, MAX_STRING)}…(${value.length})`
      : value;
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (value instanceof Date) return value.toISOString();
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [
        key,
        SENSITIVE_KEYS.has(key.toLowerCase())
          ? REDACTED
          : redact(inner, depth + 1),
      ]),
    );
  }
  return value;
}

// Applies redaction to everything a log call attached, leaving winston's own fields alone.
export const redactMeta: Logform.FormatWrap = format((info) => {
  for (const key of Object.keys(info)) {
    if (!LOG_FIELDS.has(key)) {
      info[key] = redact(info[key]);
    }
  }
  return info;
});

function toKeyValue(key: string, value: unknown): string {
  if (value === undefined) return "";
  const text =
    typeof value === "string" || typeof value === "number"
      ? String(value)
      : JSON.stringify(value);
  return `${key}=${text}`;
}

const HIDDEN_IN_DEV = new Set([
  ...LOG_FIELDS,
  "context",
  "service",
  "env",
  "ms",
  "durationMs",
]);

const LEVEL_COLOR: Record<string, string> = {
  error: "\x1b[31m",
  warn: "\x1b[33m",
  info: "\x1b[32m",
  http: "\x1b[36m",
  debug: "\x1b[90m",
  verbose: "\x1b[90m",
};
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

function toLevelLabel(level: unknown, isColored: boolean): string {
  const name = String(level);
  const label = name.toUpperCase().padEnd(5);
  const color = LEVEL_COLOR[name];
  return isColored && color ? `${color}${label}${RESET}` : label;
}

// One scannable line per event: time, level, [context], message, then key=value pairs.
export function toDevLine(
  info: Record<string, unknown>,
  isColored = false,
): string {
  const time = typeof info.timestamp === "string" ? info.timestamp : "";
  const context = typeof info.context === "string" ? ` [${info.context}]` : "";
  const pairs = Object.entries(info)
    .filter(([key]) => !HIDDEN_IN_DEV.has(key))
    .map(([key, value]) =>
      key === "requestId" && typeof value === "string"
        ? toKeyValue("req", value.slice(0, 8))
        : toKeyValue(key, value),
    )
    .filter(Boolean)
    .join(" ");
  const stack = typeof info.stack === "string" ? `\n${info.stack}` : "";
  const details = pairs
    ? `  ${isColored ? `${DIM}${pairs}${RESET}` : pairs}`
    : "";
  return `${time} ${toLevelLabel(info.level, isColored)}${context} ${String(info.message)}${details}${stack}`;
}
