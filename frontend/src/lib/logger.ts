import { clientEnv, getServerEnv } from "@/config/env";

import { createBrowserLogger } from "@/lib/logger/browser-logger";
import { createServerLogger } from "@/lib/logger/server-logger";
import type { Logger } from "@/lib/logger/types";

// `typeof window` is statically replaced per bundle target, so the winston
// branch is dead code in the browser build and never reaches the client.
export const logger: Logger =
  typeof window === "undefined"
    ? createServerLogger(getServerEnv().LOG_LEVEL)
    : createBrowserLogger(clientEnv.NEXT_PUBLIC_LOG_LEVEL);
