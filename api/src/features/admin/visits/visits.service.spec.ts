import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PrismaService } from "@/prisma/prisma.service";
import { VisitsService } from "@/features/visits/visits.service";
import { AdminVisitsService } from "./visits.service";

const containing = (value: Record<string, unknown>): unknown =>
  expect.objectContaining(value);

const row = {
  id: "VIS123",
  starts_at: new Date("2026-09-20T06:30:00.000Z"),
  ends_at: new Date("2026-09-20T07:00:00.000Z"),
  name: "Maya",
  phone: "9123456789",
  note: null,
  cancelled_at: null,
  user_id: 7,
  created_at: new Date("2026-09-17T00:00:00.000Z"),
  user: {
    id: 7,
    name: "Maya",
    email: "maya@example.com",
    image: null,
  },
};

const prismaMock = {
  studioVisit: { findMany: vi.fn(), count: vi.fn() },
};
const visitsMock = { cancel: vi.fn() };

describe("AdminVisitsService", () => {
  let service: AdminVisitsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    prismaMock.studioVisit.findMany.mockResolvedValue([row]);
    prismaMock.studioVisit.count.mockResolvedValue(1);
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminVisitsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: VisitsService, useValue: visitsMock },
      ],
    }).compile();
    service = moduleRef.get(AdminVisitsService);
  });

  it("reads as a day sheet, earliest window first", async () => {
    const result = await service.list({});

    expect(prismaMock.studioVisit.findMany).toHaveBeenCalledWith(
      containing({ orderBy: { starts_at: "asc" } }),
    );
    expect(result.page_info).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      has_more: false,
    });
  });

  it("keeps cancelled windows out of the way unless they are asked for", async () => {
    await service.list({});
    expect(prismaMock.studioVisit.findMany).toHaveBeenCalledWith(
      containing({ where: { cancelled_at: null } }),
    );

    await service.list({ include_cancelled: true });
    expect(prismaMock.studioVisit.findMany).toHaveBeenLastCalledWith(
      containing({ where: {} }),
    );
  });

  it("narrows to a date range", async () => {
    const from = new Date("2026-09-20T00:00:00.000Z");
    const to = new Date("2026-09-21T00:00:00.000Z");

    await service.list({ from, to });

    expect(prismaMock.studioVisit.findMany).toHaveBeenCalledWith(
      containing({
        where: containing({ starts_at: { gte: from, lte: to } }),
      }),
    );
  });

  it("separates the visit from the account that booked it", async () => {
    const result = await service.list({});

    expect(result.items[0]?.visit.name).toBe("Maya");
    expect(result.items[0]?.customer?.email).toBe("maya@example.com");
  });

  it("leaves the customer off a window booked without signing in", async () => {
    prismaMock.studioVisit.findMany.mockResolvedValue([
      { ...row, user_id: null, user: null },
    ]);

    const result = await service.list({});

    expect(result.items[0]?.customer).toBeNull();
  });
});
