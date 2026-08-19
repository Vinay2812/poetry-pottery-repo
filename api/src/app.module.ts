import { join } from "node:path";

import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { GraphQLModule } from "@nestjs/graphql";
import { ThrottlerModule } from "@nestjs/throttler";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { WinstonModule } from "nest-winston";

import { ClerkModule } from "@/common/clerk/clerk.module";
import { AllExceptionsFilter } from "@/common/filters/all-exceptions.filter";
import { createIntrospectionGuard } from "@/common/graphql/introspection.plugin";
import {
  GqlThrottlerGuard,
  isStrictThrottled,
  STRICT_THROTTLER,
} from "@/common/guards/gql-throttler.guard";
import { createWinstonOptions } from "@/common/logger/winston.config";
import { RequestIdMiddleware } from "@/common/middleware/request-id.middleware";
import type { GqlContext } from "@/common/types/express";
import { env } from "@/config/env";
import { HealthModule } from "@/health/health.module";
import { PrismaModule } from "@/prisma/prisma.module";
import { UsersModule } from "@/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [() => env],
    }),
    WinstonModule.forRoot(createWinstonOptions()),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: "default",
          limit: env.THROTTLE_DEFAULT_LIMIT,
          ttl: env.THROTTLE_DEFAULT_TTL_MS,
        },
        {
          name: "short",
          limit: env.THROTTLE_SHORT_LIMIT,
          ttl: env.THROTTLE_SHORT_TTL_MS,
        },
        {
          name: STRICT_THROTTLER,
          limit: env.THROTTLE_STRICT_LIMIT,
          ttl: env.THROTTLE_STRICT_TTL_MS,
          skipIf: (context) => !isStrictThrottled(context),
        },
      ],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Dev writes schema.gql for tooling; production keeps the schema in memory
      // (the container runs as a non-root user with a read-only app dir).
      autoSchemaFile: env.isProduction
        ? true
        : join(process.cwd(), "schema.gql"),
      sortSchema: true,
      playground: false,
      // Introspection is gated per-request: open in dev, key-protected in production.
      introspection: true,
      includeStacktraceInErrorResponses: !env.isProduction,
      plugins: [
        createIntrospectionGuard(),
        ...(env.isProduction
          ? []
          : [ApolloServerPluginLandingPageLocalDefault({ embed: true })]),
      ],
      context: ({ req, res }: GqlContext): GqlContext => ({ req, res }),
    }),
    ClerkModule,
    PrismaModule,
    HealthModule,
    UsersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: "*splat", method: RequestMethod.ALL });
  }
}
