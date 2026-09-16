import { GUARDS_METADATA } from "@nestjs/common/constants";
import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthGuard } from "@/common/guards/auth.guard";
import type { GqlContext } from "@/common/types/express";
import { VisitsResolver } from "./visits.resolver";
import { VisitsService } from "./visits.service";
import type { StudioVisit, StudioVisitInput } from "./visits.type";

const visitsMock = {
  availability: vi.fn<VisitsService["availability"]>(),
  book: vi.fn<VisitsService["book"]>(),
};
const authGuardMock = { tryAuthenticate: vi.fn() };
const context = { req: {} } as GqlContext;

function makeVisit(): StudioVisit {
  return {
    id: "visit1",
    starts_at: new Date("2026-09-19T06:30:00.000Z"),
    ends_at: new Date("2026-09-19T07:00:00.000Z"),
    name: "Maya",
    phone: "9123456789",
    note: null,
  };
}

function makeInput(): StudioVisitInput {
  return {
    starts_at: new Date("2026-09-19T06:30:00.000Z"),
    name: "Maya",
    phone: "9123456789",
  };
}

describe("VisitsResolver", () => {
  let resolver: VisitsResolver;

  beforeEach(async () => {
    vi.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        VisitsResolver,
        { provide: VisitsService, useValue: visitsMock },
        { provide: AuthGuard, useValue: authGuardMock },
      ],
    }).compile();
    resolver = moduleRef.get(VisitsResolver);
  });

  it("passes the calendar bounds through untouched", async () => {
    visitsMock.availability.mockResolvedValue([]);

    await resolver.studioVisitAvailability("2026-09-19", 7);

    expect(visitsMock.availability).toHaveBeenCalledWith("2026-09-19", 7);
  });

  it("files a signed-in visitor's window against their account", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue({ db_user_id: 7 });
    visitsMock.book.mockResolvedValue(makeVisit());

    const input = makeInput();
    await resolver.bookStudioVisit(input, context);

    expect(visitsMock.book).toHaveBeenCalledWith(input, 7);
  });

  it("takes a window from someone who is not signed in", async () => {
    authGuardMock.tryAuthenticate.mockResolvedValue(null);
    visitsMock.book.mockResolvedValue(makeVisit());

    await resolver.bookStudioVisit(makeInput(), context);

    expect(visitsMock.book).toHaveBeenCalledWith(expect.anything(), null);
  });

  it("leaves both the calendar and the booking open to anyone", () => {
    for (const field of ["studioVisitAvailability", "bookStudioVisit"]) {
      const handler = Object.getOwnPropertyDescriptor(
        VisitsResolver.prototype,
        field,
      )?.value as (...args: never[]) => unknown;
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toBeUndefined();
    }
  });
});
