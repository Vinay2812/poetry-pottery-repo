import { applyDecorators, SetMetadata } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import { env } from "@/config/env";
import {
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
