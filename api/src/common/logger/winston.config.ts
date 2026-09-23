import type { WinstonModuleOptions } from "nest-winston";
import { format, transports } from "winston";

import { env } from "@/config/env";
import { redactMeta, toDevLine } from "./log-format";

export const LOGGER_LABEL = "api";

// Production writes one JSON object per line for the log pipeline; development writes one readable line.
export function createWinstonOptions(): WinstonModuleOptions {
  return {
    level: env.LOG_LEVEL,
    silent: env.isTest,
    defaultMeta: { service: LOGGER_LABEL, env: env.NODE_ENV },
    transports: [
      new transports.Console({
        format: env.isProduction
          ? format.combine(
              format.errors({ stack: true }),
              redactMeta(),
              format.timestamp(),
              format.json(),
            )
          : format.combine(
              format.errors({ stack: true }),
              redactMeta(),
              format.timestamp({ format: "HH:mm:ss.SSS" }),
              format.printf((info) => toDevLine(info, true)),
            ),
      }),
    ],
  };
}
