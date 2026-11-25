import { applyDecorators, SetMetadata } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import { env } from "@/config/env";
import {
  FORM_THROTTLE_KEY,
  FORM_THROTTLER,
  STRICT_THROTTLE_KEY,
  STRICT_THROTTLER,
} from "@/common/guards/gql-throttler.guard";

export function StrictThrottle() {
  return applyDecorators(
    SetMetadata(STRICT_THROTTLE_KEY, true),
    Throttle({
      [STRICT_THROTTLER]: {
        limit: env.THROTTLE_STRICT_LIMIT,
        ttl: env.THROTTLE_STRICT_TTL_MS,
      },
    }),
  );
}

// Signed-out forms: the per-minute burst limit plus an hourly ceiling, so one visitor cannot fill tables.
export function PublicFormThrottle() {
  return applyDecorators(
    StrictThrottle(),
    SetMetadata(FORM_THROTTLE_KEY, true),
    Throttle({
      [FORM_THROTTLER]: {
        limit: env.THROTTLE_FORM_LIMIT,
        ttl: env.THROTTLE_FORM_TTL_MS,
      },
    }),
  );
}
