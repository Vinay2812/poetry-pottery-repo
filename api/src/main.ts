import "./instrument";

import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { WinstonModule } from "nest-winston";

import { AppModule } from "./app.module";
import { clerkAuthMiddleware } from "@/common/clerk/clerk.util";
import { createWinstonOptions } from "@/common/logger/winston.config";
import { env } from "@/config/env";

async function bootstrap(): Promise<void> {
  // A live logger from the first line: boot problems (like an unreachable broker) must not sit in a buffer.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(createWinstonOptions()),
  });

  app.use(
    env.isProduction
      ? helmet()
      : // Apollo Sandbox needs both relaxed to load in the browser.
        helmet({
          contentSecurityPolicy: false,
          crossOriginEmbedderPolicy: false,
        }),
  );
  app.set("trust proxy", env.TRUSTED_PROXY_HOPS);
  app.enableCors({ origin: env.CORS_ORIGINS, credentials: true });
  app.use(clerkAuthMiddleware());
  app.enableShutdownHooks();

  await app.listen(env.PORT);
}

void bootstrap();
