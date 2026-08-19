import "./instrument";

import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

import { AppModule } from "./app.module";
import { clerkAuthMiddleware } from "@/common/clerk/clerk.util";
import { env } from "@/config/env";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.use(
    env.isProduction
      ? helmet()
      : // Apollo Sandbox needs both relaxed to load in the browser.
        helmet({
          contentSecurityPolicy: false,
          crossOriginEmbedderPolicy: false,
        }),
  );
  app.enableCors({ origin: env.CORS_ORIGINS, credentials: true });
  app.use(clerkAuthMiddleware());
  app.enableShutdownHooks();

  await app.listen(env.PORT);
}

void bootstrap();
