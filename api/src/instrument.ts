import * as Sentry from "@sentry/nestjs";

import { env } from "@/config/env";
import { VISITOR_KEY_HEADER } from "@/common/visitor-ip";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.isProduction ? 0.1 : 1,
    // The shared visitor key unlocks per-visitor rate limiting, so it never leaves with an error report.
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers[VISITOR_KEY_HEADER];
      }
      return event;
    },
  });
}
