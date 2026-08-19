import type { LogLevel } from "@/config/env";

export type LogMeta = Record<string, unknown>;

export interface Logger {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
}

const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export function isLevelEnabled(level: LogLevel, threshold: LogLevel): boolean {
  return LOG_LEVEL_WEIGHT[level] <= LOG_LEVEL_WEIGHT[threshold];
}
