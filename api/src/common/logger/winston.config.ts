import { utilities, type WinstonModuleOptions } from "nest-winston";
import { format, transports } from "winston";

import { env } from "@/config/env";

export const LOGGER_LABEL = "api";

export function createWinstonOptions(): WinstonModuleOptions {
  const base = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
  );

  return {
    level: env.LOG_LEVEL,
    silent: env.isTest,
    transports: [
      new transports.Console({
        format: env.isProduction
          ? format.combine(base, format.json())
          : format.combine(
              base,
              format.ms(),
              utilities.format.nestLike(LOGGER_LABEL, {
                colors: true,
                prettyPrint: true,
              }),
            ),
      }),
    ],
  };
}
