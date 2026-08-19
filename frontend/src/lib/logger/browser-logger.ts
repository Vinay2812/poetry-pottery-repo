import type { LogLevel } from "@/config/env";

import { isLevelEnabled, type Logger, type LogMeta } from "./types";

type ConsoleMethod = (message: string, ...rest: unknown[]) => void;

const CONSOLE_METHOD: Record<LogLevel, () => ConsoleMethod> = {
  error: () => console.error,
  warn: () => console.warn,
  info: () => console.info,
  debug: () => console.debug,
};

export function createBrowserLogger(threshold: LogLevel): Logger {
  function write(level: LogLevel, message: string, meta?: LogMeta): void {
    if (!isLevelEnabled(level, threshold)) return;

    const prefix = `[${level}]`;
    if (meta) {
      CONSOLE_METHOD[level]()(`${prefix} ${message}`, meta);
      return;
    }
    CONSOLE_METHOD[level]()(`${prefix} ${message}`);
  }

  return {
    debug: (message, meta) => write("debug", message, meta),
    info: (message, meta) => write("info", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    error: (message, meta) => write("error", message, meta),
  };
}
