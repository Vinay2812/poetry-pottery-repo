import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
} from "@nestjs/common";

import { APP_FILTER, APP_GUARD } from "@nestjs/core";

import { AllExceptionsFilter } from "@/common/filters/all-exceptions.filter";
import { GqlThrottlerGuard } from "@/common/guards/gql-throttler.guard";

import { RequestIdMiddleware } from "@/common/middleware/request-id.middleware";

import * as AllModules from "./modules";

@Module({
  imports: Object.values(AllModules),
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
