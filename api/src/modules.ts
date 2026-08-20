import { ConfigModule } from "@nestjs/config";
import { env } from "@/config/env";
import { createWinstonOptions } from "@/common/logger/winston.config";
import { WINSTON_MODULE_PROVIDER, WinstonModule } from "nest-winston";
import { ThrottlerModule } from "@nestjs/throttler";
import {
  isStrictThrottled,
  STRICT_THROTTLER,
} from "@/common/guards/gql-throttler.guard";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { Logger } from "winston";
import { createIntrospectionGuard } from "./common/graphql/introspection.plugin";
import { createGraphqlLoggingPlugin } from "./common/graphql/logging.plugin";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { GqlContext } from "./common/types/express";

export const CustomConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  ignoreEnvFile: true,
  load: [() => env],
});

export const CustomWinstonModule = WinstonModule.forRoot(
  createWinstonOptions(),
);

export const CustomThrottlerModule = ThrottlerModule.forRoot({
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
});

export const CustomGraphQLModule =
  GraphQLModule.forRootAsync<ApolloDriverConfig>({
    driver: ApolloDriver,
    inject: [WINSTON_MODULE_PROVIDER],
    useFactory: (logger: Logger): ApolloDriverConfig => ({
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
        createGraphqlLoggingPlugin(logger),
        ...(env.isProduction
          ? []
          : [ApolloServerPluginLandingPageLocalDefault({ embed: true })]),
      ],
      context: ({ req, res }: GqlContext): GqlContext => ({ req, res }),
    }),
  });

export { ClerkModule } from "@/common/clerk/clerk.module";
export { PrismaModule } from "@/prisma/prisma.module";
export { HealthModule } from "@/health/health.module";

export { CollectionsModule } from "@/features/collections/collections.module";
export { UsersModule } from "@/features/users/users.module";
export { CategoriesModule } from "@/features/categories/categories.module";
