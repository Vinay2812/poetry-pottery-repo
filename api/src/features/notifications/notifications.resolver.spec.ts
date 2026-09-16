import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/common/clerk/clerk.type";
import { AuthGuard } from "@/common/guards/auth.guard";
import type {
  AppRequest,
  AppResponse,
  GqlContext,
} from "@/common/types/express";
import { NotificationsResolver } from "./notifications.resolver";
import { NotificationsService } from "./notifications.service";

function guardsOn(prototype: object, field: string): unknown[] {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    prototype,
    field,
  )?.value;
  if (typeof handler !== "function") {
    throw new Error(`${field} is not a resolver field`);
  }
  const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, handler);
  return Array.isArray(guards) ? (guards as unknown[]) : [];
}

function session(dbUserId: number): AuthUser {
  return {
    db_user_id: dbUserId,
    role: UserRole.USER,
    auth_id: `user_${dbUserId}`,
  };
}

function gqlContext(request: Partial<AppRequest> = {}): GqlContext {
  return { req: request as AppRequest, res: {} as AppResponse };
}

const notificationsMock = {
  watch: vi.fn<NotificationsService["watch"]>(),
  stopWatching: vi.fn<NotificationsService["stopWatching"]>(),
};

const authGuardMock = {
  canActivate: vi.fn<AuthGuard["canActivate"]>(),
  tryAuthenticate: vi.fn<AuthGuard["tryAuthenticate"]>(),
};

describe("NotificationsResolver", () => {
  let resolver: NotificationsResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    notificationsMock.watch.mockResolvedValue({
      email: "maya@example.com",
      was_already_waiting: false,
    });
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsResolver,
        { provide: NotificationsService, useValue: notificationsMock },
        { provide: AuthGuard, useValue: authGuardMock },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .compile();
    resolver = moduleRef.get(NotificationsResolver);
  });

  it("takes a watch from a visitor with no account behind it", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(null);

    await resolver.notifyWhenBackInStock(4, "maya@example.com", gqlContext());

    expect(notificationsMock.watch).toHaveBeenCalledWith(
      4,
      "maya@example.com",
      null,
    );
  });

  it("ties a signed-in watch to the session, not to the email typed in", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(session(7));

    await resolver.notifyWhenBackInStock(
      4,
      "someone.else@example.com",
      gqlContext(),
    );

    expect(notificationsMock.watch).toHaveBeenCalledWith(
      4,
      "someone.else@example.com",
      7,
    );
  });

  it("stops watching on the token alone", async () => {
    notificationsMock.stopWatching.mockResolvedValue(true);

    await expect(resolver.stopBatchNotification("tok_1")).resolves.toBe(true);
    expect(notificationsMock.stopWatching).toHaveBeenCalledWith("tok_1");
  });

  it("leaves both mutations open to anyone", () => {
    for (const field of ["notifyWhenBackInStock", "stopBatchNotification"]) {
      expect(guardsOn(NotificationsResolver.prototype, field)).toEqual([]);
    }
  });
});
