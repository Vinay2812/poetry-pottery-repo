import { createLogger, format, transports } from "winston";

import type { LogLevel } from "@/config/env";

import type { Logger, LogMeta } from "./types";

export function createServerLogger(threshold: LogLevel): Logger {
  const isProduction = process.env.NODE_ENV === "production";

  const winstonLogger = createLogger({
    level: threshold,
    format: isProduction
      ? format.combine(
          format.timestamp(),
          format.errors({ stack: true }),
          format.json(),
        )
      : format.combine(format.colorize(), format.timestamp(), format.simple()),
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
