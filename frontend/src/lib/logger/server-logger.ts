import { createLogger, format, transports } from "winston";

import type { LogLevel } from "@/config/env";

import type { Logger, LogMeta } from "./types";

const SERVICE = "web";
const LINE_FIELDS = new Set([
  "level",
  "message",
  "timestamp",
  "stack",
  "service",
]);

// One readable line in development: time, level, message, then key=value pairs.
export function toDevLine(info: Record<string, unknown>): string {
  const pairs = Object.entries(info)
    .filter(([key, value]) => !LINE_FIELDS.has(key) && value !== undefined)
    .map(
      ([key, value]) =>
        `${key}=${typeof value === "string" ? value : JSON.stringify(value)}`,
    )
    .join(" ");
  const trace = typeof info.stack === "string" ? `\n${info.stack}` : "";
  return `${String(info.timestamp)} ${String(info.level)} ${String(info.message)}${pairs ? `  ${pairs}` : ""}${trace}`;
}

export function createServerLogger(threshold: LogLevel): Logger {
  const isProduction = process.env.NODE_ENV === "production";

  const winstonLogger = createLogger({
    level: threshold,
    defaultMeta: { service: SERVICE },
    // Production writes JSON lines for the log pipeline, matching the API's shape.
    format: isProduction
      ? format.combine(
          format.errors({ stack: true }),
          format.timestamp(),
          format.json(),
        )
      : format.combine(
          format.errors({ stack: true }),
          format.timestamp({ format: "HH:mm:ss.SSS" }),
          format.colorize({ level: true }),
          format.printf(toDevLine),
        ),
    transports: [new transports.Console()],
  });

  const write = (level: LogLevel, message: string, meta?: LogMeta): void => {
    winstonLogger.log(level, message, meta);
  };

  return {
    debug: (message, meta) => write("debug", message, meta),
    info: (message, meta) => write("info", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    error: (message, meta) => write("error", message, meta),
  };
}
