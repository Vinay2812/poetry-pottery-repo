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
import { NewsletterResolver } from "./newsletter.resolver";
import { NewsletterService } from "./newsletter.service";
import type { NewsletterResult, NewsletterStatus } from "./newsletter.type";

function guardsOn(prototype: object, field: string): unknown[] {
  const handler: unknown = Object.getOwnPropertyDescriptor(
    prototype,
    field,
  )?.value;
  // A misspelt field would otherwise look like an unguarded one.
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

// The resolver only hands the request to the guard, so a bare stub stands in for express's.
function gqlContext(request: Partial<AppRequest> = {}): GqlContext {
  return { req: request as AppRequest, res: {} as AppResponse };
}

function makeResult(
  overrides: Partial<NewsletterResult> = {},
): NewsletterResult {
  return {
    email: "potter@example.com",
    is_active: true,
    was_already_subscribed: false,
    ...overrides,
  };
}

function makeStatus(
  overrides: Partial<NewsletterStatus> = {},
): NewsletterStatus {
  return { is_subscribed: true, email: "potter@example.com", ...overrides };
}

const newsletterMock = {
  subscribe: vi.fn<NewsletterService["subscribe"]>(),
  unsubscribe: vi.fn<NewsletterService["unsubscribe"]>(),
  status: vi.fn<NewsletterService["status"]>(),
};

const authGuardMock = {
  canActivate: vi.fn<AuthGuard["canActivate"]>(),
  tryAuthenticate: vi.fn<AuthGuard["tryAuthenticate"]>(),
};

describe("NewsletterResolver", () => {
  let resolver: NewsletterResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        NewsletterResolver,
        { provide: NewsletterService, useValue: newsletterMock },
        { provide: AuthGuard, useValue: authGuardMock },
      ],
    })
      // Nest instantiates the guard named in the UseGuards metadata, so it is stubbed out.
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .compile();
    resolver = moduleRef.get(NewsletterResolver);
  });

  it("subscribes an anonymous visitor without an account behind it", async () => {
    const result = makeResult();
    authGuardMock.tryAuthenticate.mockResolvedValue(null);
    newsletterMock.subscribe.mockResolvedValue(result);

    await expect(
      resolver.subscribeToNewsletter("potter@example.com", gqlContext()),
    ).resolves.toBe(result);
    expect(newsletterMock.subscribe).toHaveBeenCalledWith(
      "potter@example.com",
      null,
    );
  });

  it("ties a signed-in subscription to the session, not to the email typed in", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(session(7));
    newsletterMock.subscribe.mockResolvedValue(makeResult());

    await resolver.subscribeToNewsletter(
      "someone.else@example.com",
      gqlContext(),
    );

    expect(newsletterMock.subscribe).toHaveBeenCalledWith(
      "someone.else@example.com",
      7,
    );
  });

  it("offers the guard the request it was given", async () => {
    const request: Partial<AppRequest> = {};
    authGuardMock.tryAuthenticate.mockResolvedValue(null);
    newsletterMock.subscribe.mockResolvedValue(makeResult());

    await resolver.subscribeToNewsletter(
      "potter@example.com",
      gqlContext(request),
    );

    expect(authGuardMock.tryAuthenticate).toHaveBeenCalledWith(request);
  });

  it("unsubscribes on the token alone", async () => {
    newsletterMock.unsubscribe.mockResolvedValue(true);

    await expect(resolver.unsubscribeFromNewsletter("tok_1")).resolves.toBe(
      true,
    );
    expect(newsletterMock.unsubscribe).toHaveBeenCalledWith("tok_1");
  });

  it("reads the status of the session", async () => {
    const status = makeStatus();
    newsletterMock.status.mockResolvedValue(status);

    await expect(resolver.newsletterStatus(session(7))).resolves.toBe(status);
    expect(newsletterMock.status).toHaveBeenCalledWith(7);
  });

  it("leaves subscribing and unsubscribing open to anyone", () => {
    const fields = ["subscribeToNewsletter", "unsubscribeFromNewsletter"];

    for (const field of fields) {
      expect(guardsOn(NewsletterResolver.prototype, field)).toEqual([]);
    }
  });

  it("guards the status query with the authentication guard", () => {
    expect(guardsOn(NewsletterResolver.prototype, "newsletterStatus")).toEqual([
      AuthGuard,
    ]);
  });
});
