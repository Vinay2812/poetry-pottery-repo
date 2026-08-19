import * as Sentry from "@sentry/nestjs";

import { env } from "@/config/env";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.isProduction ? 0.1 : 1,
  });
}
